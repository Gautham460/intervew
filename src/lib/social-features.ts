import { db } from "@/config/firebase.config";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

export interface UserProfile {
  id?: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio: string;
  title: string;
  company?: string;
  followers: string[];
  following: string[];
  interviewsCompleted: number;
  averageScore: number;
  specializations: string[];
  joinedDate?: Date;
  website?: string;
  socialLinks?: Record<string, string>;
  isPublic: boolean;
}

export interface UserPost {
  id?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: "achievement" | "question" | "tip" | "experience";
  likes: number;
  comments: UserComment[];
  shares: number;
  interviewScore?: number;
  interviewCompany?: string;
  tags: string[];
  createdAt?: Date;
}

export interface UserComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  likes: number;
  createdAt: Date;
  replies: UserComment[];
}

export interface SocialAchievement {
  id: string;
  userId: string;
  type: "first_interview" | "perfect_score" | "streak_7" | "helped_others" | "master";
  title: string;
  description: string;
  icon: string;
  unlockedDate: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export async function createUserProfile(profile: UserProfile): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "user_profiles"), {
      ...profile,
      followers: [],
      following: [],
      joinedDate: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const q = query(collection(db, "user_profiles"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.docs.length === 0) return null;

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      joinedDate: doc.data().joinedDate?.toDate?.(),
    } as UserProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    const profileDocs = await getDocs(
      query(collection(db, "user_profiles"), where("userId", "==", userId))
    );

    if (profileDocs.docs.length > 0) {
      await updateDoc(doc(db, "user_profiles", profileDocs.docs[0].id), updates);
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export async function followUser(userId: string, targetUserId: string): Promise<void> {
  try {
    const userProfile = await getUserProfile(userId);
    const targetProfile = await getUserProfile(targetUserId);

    if (userProfile && targetProfile) {
      const userProfileDocs = await getDocs(
        query(collection(db, "user_profiles"), where("userId", "==", userId))
      );
      const targetProfileDocs = await getDocs(
        query(collection(db, "user_profiles"), where("userId", "==", targetUserId))
      );

      if (userProfileDocs.docs.length > 0 && targetProfileDocs.docs.length > 0) {
        const userFollowing = userProfile.following || [];
        const targetFollowers = targetProfile.followers || [];

        await updateDoc(doc(db, "user_profiles", userProfileDocs.docs[0].id), {
          following: [...new Set([...userFollowing, targetUserId])],
        });

        await updateDoc(doc(db, "user_profiles", targetProfileDocs.docs[0].id), {
          followers: [...new Set([...targetFollowers, userId])],
        });
      }
    }
  } catch (error) {
    console.error("Error following user:", error);
    throw error;
  }
}

export async function unfollowUser(userId: string, targetUserId: string): Promise<void> {
  try {
    const userProfile = await getUserProfile(userId);
    const targetProfile = await getUserProfile(targetUserId);

    if (userProfile && targetProfile) {
      const userProfileDocs = await getDocs(
        query(collection(db, "user_profiles"), where("userId", "==", userId))
      );
      const targetProfileDocs = await getDocs(
        query(collection(db, "user_profiles"), where("userId", "==", targetUserId))
      );

      if (userProfileDocs.docs.length > 0 && targetProfileDocs.docs.length > 0) {
        const userFollowing = (userProfile.following || []).filter((f) => f !== targetUserId);
        const targetFollowers = (targetProfile.followers || []).filter((f) => f !== userId);

        await updateDoc(doc(db, "user_profiles", userProfileDocs.docs[0].id), {
          following: userFollowing,
        });

        await updateDoc(doc(db, "user_profiles", targetProfileDocs.docs[0].id), {
          followers: targetFollowers,
        });
      }
    }
  } catch (error) {
    console.error("Error unfollowing user:", error);
    throw error;
  }
}

export async function createPost(post: UserPost): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "user_posts"), {
      ...post,
      likes: 0,
      comments: [],
      shares: 0,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

export async function getUserPosts(userId: string): Promise<UserPost[]> {
  try {
    const q = query(
      collection(db, "user_posts"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.(),
    } as UserPost));
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return [];
  }
}

export async function getFeedPosts(userId: string): Promise<UserPost[]> {
  try {
    const userProfile = await getUserProfile(userId);
    if (!userProfile) return [];

    const followingList = userProfile.following || [];
    const q = query(
      collection(db, "user_posts"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.(),
    } as UserPost));

    return posts.filter((p) => followingList.includes(p.userId) || p.userId === userId);
  } catch (error) {
    console.error("Error fetching feed posts:", error);
    return [];
  }
}

export async function likePost(postId: string, _userId: string): Promise<void> {
  try {
    const postDoc = await getDocs(
      query(collection(db, "user_posts"), where("id", "==", postId))
    );

    if (postDoc.docs.length > 0) {
      const post = postDoc.docs[0].data() as UserPost;
      await updateDoc(doc(db, "user_posts", postDoc.docs[0].id), {
        likes: (post.likes || 0) + 1,
      });
    }
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
}

export async function addComment(postId: string, comment: UserComment): Promise<void> {
  try {
    const postDoc = await getDocs(
      query(collection(db, "user_posts"), where("id", "==", postId))
    );

    if (postDoc.docs.length > 0) {
      const post = postDoc.docs[0].data() as UserPost;
      const comments = post.comments || [];
      await updateDoc(doc(db, "user_posts", postDoc.docs[0].id), {
        comments: [...comments, comment],
      });
    }
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
}

export async function searchUsers(searchTerm: string): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, "user_profiles"), limit(20));
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as UserProfile));

    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.specializations.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}

export async function getLeaderboard(limit_count: number = 20): Promise<UserProfile[]> {
  try {
    const q = query(
      collection(db, "user_profiles"),
      orderBy("averageScore", "desc"),
      limit(limit_count)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as UserProfile));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
}

export async function unlockAchievement(userId: string, achievement: SocialAchievement): Promise<void> {
  try {
    await addDoc(collection(db, "achievements"), {
      ...achievement,
      unlockedDate: new Date(),
    });

    const userProfile = await getUserProfile(userId);
    if (userProfile) {
      await updateUserProfile(userId, {
        specializations: [...(userProfile.specializations || []), achievement.title],
      });
    }
  } catch (error) {
    console.error("Error unlocking achievement:", error);
    throw error;
  }
}

export interface SocialStats {
  followers: number;
  following: number;
  totalPosts: number;
  totalLikes: number;
  achievements: number;
  influenceScore: number;
}

export function calculateSocialStats(profile: UserProfile, posts: UserPost[]): SocialStats {
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
  const influenceScore = (profile.followers?.length || 0) * 0.7 + totalLikes * 0.3;

  return {
    followers: profile.followers?.length || 0,
    following: profile.following?.length || 0,
    totalPosts: posts.length,
    totalLikes,
    achievements: 0,
    influenceScore: Math.round(influenceScore),
  };
}
