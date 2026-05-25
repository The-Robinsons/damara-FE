import { useEffect, useState } from "react";
import { Package } from "lucide-react";

import { ROUTES } from "../../app/router/routes";
import { getPostsByStudentId } from "../../features/group-buy/api/groupBuyApi";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import MyGroupBuyListView, { CreatePostShortcut } from "./MyGroupBuyListView";

export default function MyCreatedGroupBuyPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyPosts = async () => {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (!storedUser) {
        setError("로그인이 필요해요.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const user = JSON.parse(storedUser);
        const res = await getPostsByStudentId(user.studentId);
        setPosts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError("내가 올린 공구 목록을 불러오지 못했어요.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  return (
    <>
      <MyGroupBuyListView
        title="내가 올린 공구"
        subtitle="작성한 모집글을 관리해요"
        heroTitle="등록한 공동구매"
        heroDescription="모집 현황을 확인하고 필요한 내용을 이어서 관리해요."
        Icon={Package}
        accent="blue"
        posts={posts}
        loading={loading}
        error={error}
        emptyTitle="아직 등록한 공구가 없어요"
        emptyDescription="필요한 물건을 같이 살 사람을 모집해보세요."
        emptyActionLabel="공구 등록하기"
        emptyActionRoute={ROUTES.GROUP_BUY_CREATE}
      />
      <CreatePostShortcut />
    </>
  );
}
