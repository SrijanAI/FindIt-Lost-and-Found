import { ItemForm } from "@/components/items/ItemForm";

export default function ReportFoundPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Report Found Item</h1>
        <p className="text-muted-foreground mt-1">
          Nice find! Someone might be looking for this. Describe it and
          we&apos;ll try to match it with its owner.
        </p>
      </div>
      <ItemForm type="found" />
    </div>
  );
}
