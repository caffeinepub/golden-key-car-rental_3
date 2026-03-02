import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Principal } from '@icp-sdk/core/principal';
import {
  Car, Booking, Review, DiscountCode, BlogPost, UserProfile,
  CarCategory, TransmissionType, BookingStatus, AddOn, ShoppingItem,
  StripeConfiguration, UserApprovalInfo, ApprovalStatus
} from '../backend';

// ── User Profile ──────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Cars ──────────────────────────────────────────────────────────────────────

export function useGetAvailableCars() {
  const { actor, isFetching } = useActor();

  return useQuery<Car[]>({
    queryKey: ['availableCars'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableCars();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCar(carId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Car | null>({
    queryKey: ['car', carId?.toString()],
    queryFn: async () => {
      if (!actor || carId === null) return null;
      return actor.getCar(carId);
    },
    enabled: !!actor && !isFetching && carId !== null,
  });
}

export function useCreateCar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      category: CarCategory;
      transmission: TransmissionType;
      dailyRateUSD: number;
      imageUrls: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCar(params.name, params.category, params.transmission, params.dailyRateUSD, params.imageUrls);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableCars'] });
    },
  });
}

export function useUpdateCar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      carId: bigint;
      name: string;
      category: CarCategory;
      transmission: TransmissionType;
      dailyRateUSD: number;
      imageUrls: string[];
      availability: boolean;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCar(
        params.carId, params.name, params.category, params.transmission,
        params.dailyRateUSD, params.imageUrls, params.availability, params.isActive
      );
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['availableCars'] });
      queryClient.invalidateQueries({ queryKey: ['car', vars.carId.toString()] });
    },
  });
}

export function useDeleteCar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (carId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteCar(carId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableCars'] });
    },
  });
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export function useGetCarReviews(carId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Review[]>({
    queryKey: ['carReviews', carId?.toString()],
    queryFn: async () => {
      if (!actor || carId === null) return [];
      return actor.getCarReviews(carId);
    },
    enabled: !!actor && !isFetching && carId !== null,
  });
}

export function useAddReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { carId: bigint; rating: bigint; comment: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addReview(params.carId, params.rating, params.comment);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['carReviews', vars.carId.toString()] });
    },
  });
}

// ── Bookings ──────────────────────────────────────────────────────────────────

export function useBookCar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      carId: bigint;
      startDate: bigint;
      endDate: bigint;
      addOns: AddOn[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bookCar(params.carId, params.startDate, params.endDate, params.addOns);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
  });
}

export function useGetMyBookings() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Booking[]>({
    queryKey: ['myBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyBookings();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetAllBookings() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Booking[]>({
    queryKey: ['allBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCancelBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.cancelBooking(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
  });
}

export function useSetBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bookingId: bigint; status: BookingStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setBookingStatus(params.bookingId, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

// ── Promo Codes ───────────────────────────────────────────────────────────────

export function useValidatePromoCode() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (code: string): Promise<DiscountCode | null> => {
      if (!actor) throw new Error('Actor not available');
      return actor.validatePromoCode(code);
    },
  });
}

export function useCreatePromoCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { code: string; percentage: bigint; expiry: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPromoCode(params.code, params.percentage, params.expiry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
    },
  });
}

export function useDeactivatePromoCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deactivatePromoCode(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promoCodes'] });
    },
  });
}

// ── Blog ──────────────────────────────────────────────────────────────────────

export function useGetPublishedBlogPosts() {
  const { actor, isFetching } = useActor();

  return useQuery<BlogPost[]>({
    queryKey: ['publishedBlogPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublishedBlogPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBlogPost(postId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<BlogPost | null>({
    queryKey: ['blogPost', postId?.toString()],
    queryFn: async () => {
      if (!actor || postId === null) return null;
      return actor.getBlogPost(postId);
    },
    enabled: !!actor && !isFetching && postId !== null,
  });
}

export function useGetAllBlogPosts() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<BlogPost[]>({
    queryKey: ['allBlogPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBlogPosts();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useCreateOrUpdateBlogPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      content: string;
      author: string;
      published: boolean;
      thumbnailUrl: string | null;
      postId: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdateBlogPost(
        params.title, params.content, params.author,
        params.published, params.thumbnailUrl, params.postId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publishedBlogPosts'] });
      queryClient.invalidateQueries({ queryKey: ['allBlogPosts'] });
    },
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Array<[Principal, bigint]>>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetRevenue() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  const totalRevenue = useQuery<number>({
    queryKey: ['totalRevenue'],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getTotalRevenue();
    },
    enabled: !!actor && !isFetching && !!identity,
  });

  const revenuePerCar = useQuery<Array<[bigint, number]>>({
    queryKey: ['revenuePerCar'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRevenuePerCar();
    },
    enabled: !!actor && !isFetching && !!identity,
  });

  return { totalRevenue, revenuePerCar };
}

// ── Stripe ────────────────────────────────────────────────────────────────────

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetStripeConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { items: ShoppingItem[]; successUrl: string; cancelUrl: string }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createCheckoutSession(params.items, params.successUrl, params.cancelUrl);
      const session = JSON.parse(result) as { id: string; url: string };
      if (!session?.url) throw new Error('Stripe session missing url');
      return session;
    },
  });
}

// ── User Approval ─────────────────────────────────────────────────────────────

export function useListApprovals() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<UserApprovalInfo[]>({
    queryKey: ['approvals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(params.user, params.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

export function useGetUserProfile(user: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}
