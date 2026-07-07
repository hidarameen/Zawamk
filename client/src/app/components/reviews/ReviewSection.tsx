import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, ThumbsUp, MessageCircle, Send, Filter } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

interface ReviewSectionProps {
  itemId: string;
  itemType: "track" | "album" | "artist";
  averageRating?: number;
  totalReviews?: number;
}

export default function ReviewSection({ 
  itemId, 
  itemType, 
  averageRating = 4.5, 
  totalReviews = 0 
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const { user } = useAuth();

  const loadReviews = async () => {
    setLoading(true);
    try {
      const key = itemType === 'track' ? 'trackId' : 'albumId';
      const res = await fetch(`https://music.hidar.eu.cc/api/reviews?${key}=${itemId}`);
      if (res.ok) {
        const data = await res.json();
        const mapped = (data || []).map((r: any) => ({
          id: r.id,
          user: r.user?.name || 'مستخدم',
          userAvatar: r.user?.avatar || 'https://i.pravatar.cc/100',
          rating: r.rating,
          comment: r.comment || '',
          likes: 0,
          replies: 0,
          date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar') : '',
          isLiked: false,
        }));
        setReviews(mapped);
      }
    } catch (e) {
      console.error('Failed to load reviews');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (itemId) loadReviews();
  }, [itemId, itemType]);

  const handleLike = (reviewId: string) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            isLiked: !review.isLiked, 
            likes: review.isLiked ? review.likes - 1 : review.likes + 1 
          }
        : review
    ));
  };

  const submitReview = async () => {
    if (!user) {
      toast.error('يجب تسجيل الدخول لإضافة تقييم');
      return;
    }
    if (userRating === 0 || !userComment.trim()) return;

    try {
      const payload: any = { rating: userRating, comment: userComment.trim() };
      if (itemType === 'track') payload.trackId = itemId;
      else payload.albumId = itemId;

      const res = await fetch('https://music.hidar.eu.cc/api/reviews', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success('شكراً لتقييمك!');
        setUserRating(0);
        setUserComment('');
        loadReviews();
      } else {
        toast.error('فشل إرسال التقييم');
      }
    } catch (e) {
      toast.error('حدث خطأ');
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "recent") return 0;
    if (sortBy === "highest") return b.rating - a.rating;
    if (sortBy === "lowest") return a.rating - b.rating;
    if (sortBy === "popular") return b.likes - a.likes;
    return 0;
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`w-5 h-5 ${idx < Math.round(averageRating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{reviews.length} تقييم</p>
          </div>

          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2 mb-2">
                  <span className="text-sm w-12">{stars} نجوم</span>
                  <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                    <motion.div className="h-full bg-yellow-500" initial={{ width: 0 }} animate={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-left">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">أضف تقييمك</h3>
        
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium">تقييمك:</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setUserRating(idx + 1)}
                onMouseEnter={() => setHoverRating(idx + 1)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star className={`w-8 h-8 cursor-pointer transition-colors ${idx < (hoverRating || userRating) ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
              </motion.button>
            ))}
          </div>
          {userRating > 0 && <span className="text-sm text-muted-foreground">({userRating} نجوم)</span>}
        </div>

        <Textarea
          placeholder="شاركنا رأيك..."
          value={userComment}
          onChange={(e) => setUserComment(e.target.value)}
          className="mb-4 min-h-[100px]"
        />

        <Button 
          onClick={submitReview} 
          disabled={userRating === 0 || !userComment.trim()}
          className="gap-2"
        >
          <Send className="w-4 h-4" />
          نشر التقييم
        </Button>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">التقييمات ({reviews.length})</h3>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px] max-w-full">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="ترتيب حسب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">الأحدث</SelectItem>
            <SelectItem value="highest">الأعلى تقييماً</SelectItem>
            <SelectItem value="lowest">الأقل تقييماً</SelectItem>
            <SelectItem value="popular">الأكثر إعجاباً</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {sortedReviews.map((review, idx) => (
            <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ delay: idx * 0.05 }}>
              <Card className="p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={review.userAvatar} />
                    <AvatarFallback>{review.user[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{review.user}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star key={idx} className={`w-4 h-4 ${idx < review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm mb-4 leading-relaxed">{review.comment}</p>
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="gap-2" onClick={() => handleLike(review.id)}>
                        <ThumbsUp className={`w-4 h-4 ${review.isLiked ? "fill-primary text-primary" : ""}`} />
                        <span className={review.isLiked ? "text-primary" : ""}>{review.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <MessageCircle className="w-4 h-4" />
                        {review.replies > 0 ? `${review.replies} ردود` : "رد"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {reviews.length === 0 && !loading && (
        <Card className="p-6 md:p-12 text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">لا توجد تقييمات بعد</h3>
          <p className="text-muted-foreground">كن أول من يقيّم!</p>
        </Card>
      )}
    </div>
  );
}
