import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2 } from "lucide-react";
import type { UserProfile, UserPost } from "@/lib/social-features";
import {
  createUserProfile,
  getUserProfile,
  createPost,
  getUserPosts,
  getFeedPosts,
  likePost,
  calculateSocialStats,
} from "@/lib/social-features";

export default function SocialFeaturesPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [feedPosts, setFeedPosts] = useState<UserPost[]>([]);
  const [newPost, setNewPost] = useState("");
  const [selectedTab, setSelectedTab] = useState<"feed" | "profile">("feed");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Try to get existing profile
      let profile = await getUserProfile("current-user");

      // If doesn't exist, create one
      if (!profile) {
        const newProfile: UserProfile = {
          userId: "current-user",
          username: "interview_pro_123",
          displayName: "John Developer",
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
          bio: "🚀 Software Engineer | Interview Preparation Enthusiast",
          title: "Senior Software Engineer",
          company: "Tech Corp",
          followers: [],
          following: [],
          interviewsCompleted: 15,
          averageScore: 82,
          specializations: ["React", "System Design", "Algorithms"],
          website: "https://johndeveloper.com",
          isPublic: true,
        };

        await createUserProfile(newProfile);
        setUserProfile(newProfile);
      } else {
        setUserProfile(profile);
      }

      // Load posts
      const userPosts = await getUserPosts("current-user");
      setPosts(userPosts);

      // Load feed
      const feed = await getFeedPosts("current-user");
      setFeedPosts(feed);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost || !userProfile) return;

    setLoading(true);
    try {
      const post: UserPost = {
        userId: "current-user",
        userName: userProfile.displayName,
        userAvatar: userProfile.avatarUrl,
        content: newPost,
        type: "achievement",
        likes: 0,
        comments: [],
        shares: 0,
        tags: ["interview", "preparation"],
      };

      await createPost(post);
      setNewPost("");
      loadUserData();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId: string | undefined) => {
    if (!postId) return;
    try {
      await likePost(postId, "current-user");
      loadUserData();
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const stats = userProfile ? calculateSocialStats(userProfile, posts) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Interview Community</h1>
          <p className="text-gray-600">Share achievements, connect with others, and grow together</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Profile Card */}
          {userProfile && (
            <div className="lg:col-span-1">
              <Card className="shadow-lg sticky top-8">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <Avatar className="h-16 w-16 mx-auto mb-3">
                      <AvatarImage src={userProfile.avatarUrl} />
                      <AvatarFallback>{userProfile.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg">{userProfile.displayName}</h3>
                    <p className="text-sm text-gray-600">@{userProfile.username}</p>
                    <p className="text-xs text-gray-500 mt-1">{userProfile.title}</p>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{userProfile.bio}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-lg font-bold text-blue-600">{stats?.followers || 0}</p>
                      <p className="text-xs text-gray-600">Followers</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="text-lg font-bold text-green-600">{stats?.following || 0}</p>
                      <p className="text-xs text-gray-600">Following</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <p className="text-lg font-bold text-purple-600">
                        {userProfile.interviewsCompleted}
                      </p>
                      <p className="text-xs text-gray-600">Interviews</p>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <p className="text-lg font-bold text-orange-600">
                        {userProfile.averageScore}%
                      </p>
                      <p className="text-xs text-gray-600">Avg Score</p>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Specializations:</p>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.specializations.map((spec) => (
                        <span
                          key={spec}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full mb-2">Edit Profile</Button>
                  <Button variant="outline" className="w-full">
                    Share Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Feed */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <Button
                onClick={() => setSelectedTab("feed")}
                variant={selectedTab === "feed" ? "default" : "outline"}
              >
                Community Feed
              </Button>
              <Button
                onClick={() => setSelectedTab("profile")}
                variant={selectedTab === "profile" ? "default" : "outline"}
              >
                My Posts
              </Button>
            </div>

            {/* Create Post */}
            <Card className="mb-6 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userProfile?.avatarUrl} />
                    <AvatarFallback>{userProfile?.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Share your interview experience, tips, or achievements..."
                      rows={3}
                      className="mb-3"
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          📸 Photo
                        </Button>
                        <Button variant="outline" size="sm">
                          #️⃣ Tag
                        </Button>
                      </div>
                      <Button
                        onClick={handleCreatePost}
                        disabled={loading || !newPost}
                        size="sm"
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feed Posts */}
            <div className="space-y-4">
              {(selectedTab === "feed" ? feedPosts : posts).map((post) => (
                <Card key={post.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.userAvatar} />
                          <AvatarFallback>{post.userName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{post.userName}</p>
                          <p className="text-xs text-gray-600">2 hours ago</p>
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {post.type}
                      </span>
                    </div>

                    {/* Post Content */}
                    <p className="text-gray-800 mb-3">{post.content}</p>

                    {/* Post Metadata */}
                    {post.interviewScore && (
                      <div className="bg-blue-50 p-3 rounded mb-3 text-sm">
                        <p className="font-semibold">
                          Scored {post.interviewScore}% on {post.interviewCompany} interview
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs text-blue-600 cursor-pointer hover:underline"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Interactions */}
                    <div className="flex gap-4 text-gray-600 border-t pt-3">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center gap-1 hover:text-red-600 transition-colors"
                      >
                        <Heart className="h-4 w-4" /> {post.likes}
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                        <MessageSquare className="h-4 w-4" /> {post.comments.length}
                      </button>
                      <button className="flex items-center gap-1 hover:text-green-600 transition-colors">
                        <Share2 className="h-4 w-4" /> {post.shares}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
