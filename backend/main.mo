import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Time "mo:core/Time";
import List "mo:core/List";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

actor {
  // Set up mixins
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let approvalState = UserApproval.initState(accessControlState);

  public type CarCategory = {
    #economy;
    #suv;
    #luxury;
    #van;
  };

  public type TransmissionType = {
    #automatic;
    #manual;
  };

  public type Car = {
    id : Nat;
    name : Text;
    category : CarCategory;
    transmission : TransmissionType;
    dailyRateUSD : Float;
    imageUrls : [Text];
    availability : Bool;
    isActive : Bool;
  };

  module Car {
    public func compareByRentalCount(car1 : Car, car2 : Car) : Order.Order {
      Nat.compare(car1.id, car2.id);
    };
  };

  public type BookingStatus = {
    #pending;
    #confirmed;
    #cancelled;
    #completed;
  };

  public type Booking = {
    id : Nat;
    carId : Nat;
    user : Principal;
    startDate : Int;
    endDate : Int;
    status : BookingStatus;
    totalAmountUSD : Float;
    addOns : [AddOn];
    paymentMethod : { #stripe };
  };

  public type AddOn = {
    name : Text;
    dailyCostUSD : Float;
  };

  public type Review = {
    carId : Nat;
    user : Principal;
    rating : Nat;
    comment : Text;
    timestamp : Int;
  };

  public type DiscountCode = {
    code : Text;
    percentage : Nat;
    isActive : Bool;
    expiry : Int;
  };

  public type Currency = {
    #usd;
    #aed;
    #eur;
  };

  module Currency {
    public func getConversionRate(from : Currency, to : Currency) : Float {
      switch (from, to) {
        case (#usd, #aed) { 3.67 };
        case (#usd, #eur) { 0.92 };
        case (#aed, #usd) { 0.27 };
        case (#aed, #eur) { 0.25 };
        case (#eur, #usd) { 1.09 };
        case (#eur, #aed) { 4.00 };
        case (_, _) { 1.0 };
      };
    };
  };

  public type BlogPost = {
    id : Nat;
    title : Text;
    content : Text;
    author : Text;
    date : Int;
    published : Bool;
    thumbnailUrl : ?Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
  };

  var nextCarId = 1;
  var nextBookingId = 1;
  var nextBlogPostId = 1;

  let carStore = Map.empty<Nat, Car>();
  let bookingStore = Map.empty<Nat, Booking>();
  let reviewStore = List.empty<Review>();
  let discountStore = Map.empty<Text, DiscountCode>();
  let blogStore = Map.empty<Nat, BlogPost>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let defaultAddOns = [
    { name = "Child Seat"; dailyCostUSD = 5.0 },
    { name = "Additional Driver"; dailyCostUSD = 10.0 },
    { name = "Unlimited KM"; dailyCostUSD = 15.0 },
  ];

  // Stripe state
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // ── User Profile ──────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can save their profile");
    };
    userProfiles.add(caller, profile);
  };

  // ── Cars (public read) ────────────────────────────────────────────────────

  /// Anyone can browse available cars — no auth required.
  public query ({ caller }) func getAvailableCars() : async [Car] {
    carStore.values().toArray().filter(
      func(car) {
        car.isActive and car.availability;
      }
    );
  };

  /// Anyone can view a single car's details — no auth required.
  public query ({ caller }) func getCar(carId : Nat) : async ?Car {
    carStore.get(carId);
  };

  // ── Cars (admin CRUD) ─────────────────────────────────────────────────────

  public shared ({ caller }) func createCar(
    name : Text,
    category : CarCategory,
    transmission : TransmissionType,
    dailyRateUSD : Float,
    imageUrls : [Text],
  ) : async Car {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create cars");
    };

    let car = {
      id = nextCarId;
      name;
      category;
      transmission;
      dailyRateUSD;
      imageUrls;
      availability = true;
      isActive = true;
    };

    carStore.add(nextCarId, car);
    nextCarId += 1;
    car;
  };

  public shared ({ caller }) func updateCar(
    carId : Nat,
    name : Text,
    category : CarCategory,
    transmission : TransmissionType,
    dailyRateUSD : Float,
    imageUrls : [Text],
    availability : Bool,
    isActive : Bool,
  ) : async Car {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update cars");
    };

    switch (carStore.get(carId)) {
      case (null) { Runtime.trap("Car not found") };
      case (?existing) {
        let updated = {
          id = carId;
          name;
          category;
          transmission;
          dailyRateUSD;
          imageUrls;
          availability;
          isActive;
        };
        carStore.add(carId, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteCar(carId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete cars");
    };

    switch (carStore.get(carId)) {
      case (null) { Runtime.trap("Car not found") };
      case (?car) {
        let deactivated = { car with isActive = false };
        carStore.add(carId, deactivated);
      };
    };
  };

  public shared ({ caller }) func toggleCarAvailability(carId : Nat, available : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update car availability");
    };

    switch (carStore.get(carId)) {
      case (null) { Runtime.trap("Car not found") };
      case (?car) {
        let updatedCar = { car with availability = available };
        carStore.add(carId, updatedCar);
      };
    };
  };

  // ── Bookings ──────────────────────────────────────────────────────────────

  public shared ({ caller }) func bookCar(
    carId : Nat,
    startDate : Int,
    endDate : Int,
    addOns : [AddOn],
  ) : async Booking {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to book a car");
    };

    if (startDate < Time.now() or endDate <= startDate) {
      Runtime.trap("Invalid booking dates");
    };

    let car = switch (carStore.get(carId)) {
      case (null) { Runtime.trap("Car not found") };
      case (?car) { car };
    };

    if (not car.isActive or not car.availability) {
      Runtime.trap("Car is not available for booking");
    };

    let rentalDays = ((endDate - startDate) / (24 * 3600 * 1000000)).toFloat();
    let baseCost = rentalDays * car.dailyRateUSD;
    let addOnCost = addOns.foldLeft(
      0.0,
      func(sum, addOn) {
        sum + (addOn.dailyCostUSD * rentalDays);
      },
    );
    let totalAmountUSD = baseCost + addOnCost;

    let booking = {
      id = nextBookingId;
      carId;
      user = caller;
      startDate;
      endDate;
      status = #pending;
      totalAmountUSD;
      addOns;
      paymentMethod = #stripe;
    };

    bookingStore.add(nextBookingId, booking);
    nextBookingId += 1;

    booking;
  };

  /// Users can only see their own bookings; admins can see all bookings.
  public query ({ caller }) func getMyBookings() : async [Booking] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to view bookings");
    };

    bookingStore.values().toArray().filter(
      func(booking) {
        booking.user == caller;
      }
    );
  };

  /// Admin-only: view all bookings, optionally filtered by status.
  public query ({ caller }) func getAllBookings() : async [Booking] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };

    bookingStore.values().toArray();
  };

  /// Admin-only: view bookings filtered by status.
  public query ({ caller }) func getBookingsByStatus(status : BookingStatus) : async [Booking] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can filter all bookings by status");
    };

    bookingStore.values().toArray().filter(
      func(booking) {
        booking.status == status;
      }
    );
  };

  /// Admin-only: change booking status (confirm, complete, cancel).
  public shared ({ caller }) func setBookingStatus(bookingId : Nat, status : BookingStatus) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update booking status");
    };

    switch (bookingStore.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        let updatedBooking = { booking with status };
        bookingStore.add(bookingId, updatedBooking);
      };
    };
  };

  /// Users can cancel their own bookings that are still pending or confirmed.
  public shared ({ caller }) func cancelBooking(bookingId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to cancel a booking");
    };

    switch (bookingStore.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        if (booking.user != caller) {
          Runtime.trap("Unauthorized: Can only cancel your own bookings");
        };
        switch (booking.status) {
          case (#pending or #confirmed) {
            let updatedBooking = { booking with status = #cancelled };
            bookingStore.add(bookingId, updatedBooking);
          };
          case (_) {
            Runtime.trap("Booking cannot be cancelled in its current status");
          };
        };
      };
    };
  };

  // ── Reviews ───────────────────────────────────────────────────────────────

  public shared ({ caller }) func addReview(carId : Nat, rating : Nat, comment : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to leave a review");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    let hasCompletedBooking = bookingStore.values().toArray().any(
      func(booking) {
        booking.user == caller and booking.carId == carId and booking.status == #completed;
      }
    );

    if (not hasCompletedBooking) {
      Runtime.trap("Can only review cars that you have completed a booking for");
    };

    let review = {
      carId;
      user = caller;
      rating;
      comment;
      timestamp = Time.now();
    };

    reviewStore.add(review);
  };

  /// Anyone can read reviews for a car — no auth required.
  public query ({ caller }) func getCarReviews(carId : Nat) : async [Review] {
    reviewStore.toArray().filter(
      func(review) {
        review.carId == carId;
      }
    );
  };

  // ── Promo / Discount Codes ────────────────────────────────────────────────

  /// Admin-only: create a promo code.
  public shared ({ caller }) func createPromoCode(
    code : Text,
    percentage : Nat,
    expiry : Int,
  ) : async DiscountCode {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create promo codes");
    };

    let discount = {
      code;
      percentage;
      isActive = true;
      expiry;
    };

    discountStore.add(code, discount);
    discount;
  };

  /// Admin-only: deactivate a promo code.
  public shared ({ caller }) func deactivatePromoCode(code : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can deactivate promo codes");
    };

    switch (discountStore.get(code)) {
      case (null) { Runtime.trap("Promo code not found") };
      case (?discount) {
        let updated = { discount with isActive = false };
        discountStore.add(code, updated);
      };
    };
  };

  /// Authenticated users can validate a promo code before applying it.
  public query ({ caller }) func validatePromoCode(code : Text) : async ?DiscountCode {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be authenticated to validate promo codes");
    };

    switch (discountStore.get(code)) {
      case (null) { null };
      case (?discount) {
        if (discount.isActive and discount.expiry > Time.now()) {
          ?discount;
        } else {
          null;
        };
      };
    };
  };

  // ── Blog / CMS ────────────────────────────────────────────────────────────

  /// Admin-only: create or update a blog post.
  public shared ({ caller }) func createOrUpdateBlogPost(
    title : Text,
    content : Text,
    author : Text,
    published : Bool,
    thumbnailUrl : ?Text,
    postId : ?Nat,
  ) : async BlogPost {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create or update blog posts");
    };

    let id = switch (postId) {
      case (null) {
        let newId = nextBlogPostId;
        nextBlogPostId += 1;
        newId;
      };
      case (?id) { id };
    };

    let blogPost = {
      id;
      title;
      content;
      author;
      date = Time.now();
      published;
      thumbnailUrl;
    };

    blogStore.add(id, blogPost);
    blogPost;
  };

  /// Anyone can read published blog posts — no auth required.
  public query ({ caller }) func getPublishedBlogPosts() : async [BlogPost] {
    blogStore.values().toArray().filter(
      func(post) {
        post.published;
      }
    );
  };

  /// Anyone can read a single published blog post — no auth required.
  public query ({ caller }) func getBlogPost(postId : Nat) : async ?BlogPost {
    switch (blogStore.get(postId)) {
      case (null) { null };
      case (?post) {
        if (post.published) { ?post } else { null };
      };
    };
  };

  /// Admin-only: get all blog posts including unpublished ones.
  public query ({ caller }) func getAllBlogPosts() : async [BlogPost] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all blog posts");
    };

    blogStore.values().toArray();
  };

  // ── User Management (admin) ───────────────────────────────────────────────

  /// Admin-only: get all registered user principals with their booking counts.
  public query ({ caller }) func getAllUsers() : async [(Principal, Nat)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    let allBookings = bookingStore.values().toArray();
    userProfiles.entries().toArray().map(
      func((principal, _profile)) {
        let count = allBookings.filter(func(b) { b.user == principal }).size();
        (principal, count);
      }
    );
  };

  // ── Revenue Reports (admin) ───────────────────────────────────────────────

  /// Admin-only: get total revenue from completed bookings.
  public query ({ caller }) func getTotalRevenue() : async Float {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view revenue reports");
    };

    bookingStore.values().toArray().foldLeft(
      0.0,
      func(sum, booking) {
        if (booking.status == #completed) {
          sum + booking.totalAmountUSD;
        } else {
          sum;
        };
      },
    );
  };

  /// Admin-only: get per-car revenue breakdown from completed bookings.
  public query ({ caller }) func getRevenuePerCar() : async [(Nat, Float)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view revenue reports");
    };

    let revenueMap = Map.empty<Nat, Float>();

    for (booking in bookingStore.values()) {
      if (booking.status == #completed) {
        let current = switch (revenueMap.get(booking.carId)) {
          case (null) { 0.0 };
          case (?v) { v };
        };
        revenueMap.add(booking.carId, current + booking.totalAmountUSD);
      };
    };

    revenueMap.entries().toArray();
  };

  // ── Stripe Integration ────────────────────────────────────────────────────

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  func getStripeScopedConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeScopedConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeScopedConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // ── User Approval ─────────────────────────────────────────────────────────

  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };
};
