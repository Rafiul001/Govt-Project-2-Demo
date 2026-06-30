import { DirectorCard } from "@/components/molecules/DirectorCard";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { boardOfDirectors } from "@/lib/data";

/** Officials / board-of-directors grid, ordered by display `order`. */
export function BoardOfDirectors() {
  const members = [...boardOfDirectors].sort((a, b) => a.order - b.order);

  return (
    <section id="board" className="scroll-mt-20 bg-white py-14">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          title="পরিচালনা পর্ষদ"
          subtitle="প্রতিষ্ঠানের নীতিনির্ধারণ ও পরিচালনায় নিয়োজিত সম্মানিত কর্মকর্তাবৃন্দ।"
          align="center"
        />

        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => (
            <DirectorCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
