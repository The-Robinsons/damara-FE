import { useEffect, useState } from "react";
import { Users } from "lucide-react";

import { ROUTES } from "../../app/router/routes";
import { getMyPosts } from "../../features/user/api/userApi";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import MyGroupBuyListView, { normalizeJoinedPosts } from "./MyGroupBuyListView";

export default function MyJoinedGroupBuyPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParticipatedPosts = async () => {
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) {
        setError("로그인이 필요해요.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await getMyPosts(userId, { tab: "participated" });
        setPosts(normalizeJoinedPosts(res.data?.items));
      } catch (err) {
        console.error(err);
        setError("참여한 공구 목록을 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    };

    fetchParticipatedPosts();
  }, []);

  return (
    <MyGroupBuyListView
      title="참여한 공구"
      subtitle="내가 참여 중인 거래를 확인해요"
      heroTitle="참여 중인 공동구매"
      heroDescription="픽업 일정과 진행 상태를 빠르게 확인할 수 있어요."
      Icon={Users}
      accent="blue"
      posts={posts}
      loading={loading}
      error={error}
      emptyTitle="참여한 공구가 없어요"
      emptyDescription="필요한 물건을 찾고 함께 구매할 공구에 참여해보세요."
      emptyActionLabel="공구 둘러보기"
      emptyActionRoute={ROUTES.HOME}
    />
  );
}
