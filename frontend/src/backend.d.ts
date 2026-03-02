import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Review {
    carId: bigint;
    user: Principal;
    comment: string;
    timestamp: bigint;
    rating: bigint;
}
export interface Car {
    id: bigint;
    imageUrls: Array<string>;
    name: string;
    isActive: boolean;
    availability: boolean;
    dailyRateUSD: number;
    transmission: TransmissionType;
    category: CarCategory;
}
export interface BlogPost {
    id: bigint;
    title: string;
    content: string;
    thumbnailUrl?: string;
    date: bigint;
    published: boolean;
    author: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface AddOn {
    dailyCostUSD: number;
    name: string;
}
export interface DiscountCode {
    code: string;
    isActive: boolean;
    expiry: bigint;
    percentage: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Booking {
    id: bigint;
    status: BookingStatus;
    paymentMethod: Variant_stripe;
    endDate: bigint;
    carId: bigint;
    user: Principal;
    totalAmountUSD: number;
    addOns: Array<AddOn>;
    startDate: bigint;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    name: string;
    email: string;
    phone: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed"
}
export enum CarCategory {
    suv = "suv",
    van = "van",
    economy = "economy",
    luxury = "luxury"
}
export enum TransmissionType {
    automatic = "automatic",
    manual = "manual"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_stripe {
    stripe = "stripe"
}
export interface backendInterface {
    addReview(carId: bigint, rating: bigint, comment: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookCar(carId: bigint, startDate: bigint, endDate: bigint, addOns: Array<AddOn>): Promise<Booking>;
    /**
     * / Users can cancel their own bookings that are still pending or confirmed.
     */
    cancelBooking(bookingId: bigint): Promise<void>;
    createCar(name: string, category: CarCategory, transmission: TransmissionType, dailyRateUSD: number, imageUrls: Array<string>): Promise<Car>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    /**
     * / Admin-only: create or update a blog post.
     */
    createOrUpdateBlogPost(title: string, content: string, author: string, published: boolean, thumbnailUrl: string | null, postId: bigint | null): Promise<BlogPost>;
    /**
     * / Admin-only: create a promo code.
     */
    createPromoCode(code: string, percentage: bigint, expiry: bigint): Promise<DiscountCode>;
    /**
     * / Admin-only: deactivate a promo code.
     */
    deactivatePromoCode(code: string): Promise<void>;
    deleteCar(carId: bigint): Promise<void>;
    /**
     * / Admin-only: get all blog posts including unpublished ones.
     */
    getAllBlogPosts(): Promise<Array<BlogPost>>;
    /**
     * / Admin-only: view all bookings, optionally filtered by status.
     */
    getAllBookings(): Promise<Array<Booking>>;
    /**
     * / Admin-only: get all registered user principals with their booking counts.
     */
    getAllUsers(): Promise<Array<[Principal, bigint]>>;
    /**
     * / Anyone can browse available cars — no auth required.
     */
    getAvailableCars(): Promise<Array<Car>>;
    /**
     * / Anyone can read a single published blog post — no auth required.
     */
    getBlogPost(postId: bigint): Promise<BlogPost | null>;
    /**
     * / Admin-only: view bookings filtered by status.
     */
    getBookingsByStatus(status: BookingStatus): Promise<Array<Booking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Anyone can view a single car's details — no auth required.
     */
    getCar(carId: bigint): Promise<Car | null>;
    /**
     * / Anyone can read reviews for a car — no auth required.
     */
    getCarReviews(carId: bigint): Promise<Array<Review>>;
    /**
     * / Users can only see their own bookings; admins can see all bookings.
     */
    getMyBookings(): Promise<Array<Booking>>;
    /**
     * / Anyone can read published blog posts — no auth required.
     */
    getPublishedBlogPosts(): Promise<Array<BlogPost>>;
    /**
     * / Admin-only: get per-car revenue breakdown from completed bookings.
     */
    getRevenuePerCar(): Promise<Array<[bigint, number]>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    /**
     * / Admin-only: get total revenue from completed bookings.
     */
    getTotalRevenue(): Promise<number>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    /**
     * / Admin-only: change booking status (confirm, complete, cancel).
     */
    setBookingStatus(bookingId: bigint, status: BookingStatus): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    toggleCarAvailability(carId: bigint, available: boolean): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateCar(carId: bigint, name: string, category: CarCategory, transmission: TransmissionType, dailyRateUSD: number, imageUrls: Array<string>, availability: boolean, isActive: boolean): Promise<Car>;
    /**
     * / Authenticated users can validate a promo code before applying it.
     */
    validatePromoCode(code: string): Promise<DiscountCode | null>;
}
