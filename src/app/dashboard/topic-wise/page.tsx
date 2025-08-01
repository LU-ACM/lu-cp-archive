import TopicSubmitApproveSection from "./_components/topic-submit-approve-section";
import TopicCardSection from "./_components/topic-card-section";

export default function TopicWise() {
  return (
    <div className="py-8">
      <div className="mb-8 flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
        <div className="flex items-center">
          <span className="text-center font-mono text-2xl font-bold tracking-wide md:text-left">
            Topic Wise Problems
          </span>
        </div>
        <TopicSubmitApproveSection />
      </div>
      <TopicCardSection />
    </div>
  );
}
