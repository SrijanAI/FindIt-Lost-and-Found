import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MatchScoreBadgeProps {
  score: number;
}

export function MatchScoreBadge({ score }: MatchScoreBadgeProps) {
  const percentage = Math.round(score * 100);

  let label: string;
  let colorClasses: string;

  if (score >= 0.7) {
    label = "Strong Match";
    colorClasses = "bg-success/10 text-success";
  } else if (score >= 0.5) {
    label = "Possible Match";
    colorClasses = "bg-amber/10 text-amber";
  } else {
    label = "Weak Match";
    colorClasses = "bg-destructive/10 text-destructive";
  }

  return (
    <Badge className={cn("border-0", colorClasses)}>
      {label} &middot; {percentage}%
    </Badge>
  );
}
