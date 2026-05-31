import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

import { ROUTES } from "../../app/router/routes";
import { getMyPosts } from "../../features/user/api/userApi";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import MyGroupBuyListView, { normalizeFavoritePosts } from "./MyGroupBuyListView";

export default function FavoriteGroupBuyPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavoritePosts = async () => {
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) {
        setError("로그인이 필요해요.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await getMyPosts(userId, { tab: "favorites" });
        setPosts(normalizeFavoritePosts(res.data?.items));
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 404) {
          setPosts([]);
          setError(null);
          return;
        }
        setError("관심목록을 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavoritePosts();
  }, []);

  return (
    <MyGroupBuyListView
      title="관심목록"
      subtitle="찜한 공구를 모아봤어요"
      heroTitle="관심 공동구매"
      heroDescription="나중에 다시 보고 싶은 공구를 한곳에서 확인해요."
      Icon={Heart}
      accent="blue"
      posts={posts}
      loading={loading}
      error={error}
      emptyTitle="관심목록이 비어 있어요"
      emptyDescription="마음에 드는 공구의 하트를 누르면 여기에서 다시 볼 수 있어요."
      emptyActionLabel="공구 둘러보기"
      emptyActionRoute={ROUTES.HOME}
    />
  );
}
