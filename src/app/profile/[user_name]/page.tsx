import MaxWidthWrapper from "@/components/max-width-wrapper";
import UserHeading from "./_components/user-heading";
import ActivityStats from "./_components/activity-stats";
import CodeforcesSettings from "./_components/codeforces-settings";
import { parseUsername } from "@/utils/helper";
import { getUserByUserName } from "@/components/shared-actions/actions";
import { isActionError } from "@/utils/error-helper";
import { notFound } from "next/navigation";
import UserManagement from "./_components/user-management";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/utils/permissions";
import Achievements from "./_components/achievements";

export default async function Profile({
  params,
}: {
  params: { user_name: string };
}) {
  const session = await auth();
  if (!session) {
    notFound();
  }
  const userName = parseUsername(params.user_name);
  const user = await getUserByUserName(userName);

  if (isActionError(user)) {
    notFound();
  }

  const isOwner = session.user.id === user.data.id;

  const hasViewPermission = hasPermission(
    session.user.user_type,
    "view-user-management"
  );

  return (
    <MaxWidthWrapper>
      <div className="py-8">
        <UserHeading userData={user.data} />
        <div className="grid gap-6 md:grid-cols-2">
          <ActivityStats userData={user.data} />
          <CodeforcesSettings userData={user.data} />
          <div className="md:col-span-2">
            <Achievements user={user.data} />
          </div>
        </div>
        {hasViewPermission && isOwner && (
          <div className="my-6">
            <UserManagement />
          </div>
        )}
      </div>
    </MaxWidthWrapper>
  );
}
