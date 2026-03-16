import MaxWidthWrapper from "@/components/max-width-wrapper";
import { getUserByUserName } from "@/components/shared-actions/actions";
import { isActionError } from "@/utils/error-helper";
import { notFound } from "next/navigation";
import UserHeading from "../_components/user-heading";
import Achievements from "../_components/achievements";

export default async function AchievementsSharePage({
  params,
}: {
  params: Promise<{ user_name: string }>;
}) {
  const { user_name } = await params;
  const decodedUserName = decodeURIComponent(user_name).replace("@", "");
  const user = await getUserByUserName(decodedUserName);

  if (isActionError(user)) {
    notFound();
  }

  return (
    <MaxWidthWrapper>
      <div className="py-8">
        <UserHeading userData={user.data} />
        <Achievements user={user.data} />
      </div>
    </MaxWidthWrapper>
  );
}
