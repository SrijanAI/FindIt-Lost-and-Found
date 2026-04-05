import { ItemForm } from "@/components/items/ItemForm";

export default function ReportLostPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Report Lost Item</h1>
        <p className="text-muted-foreground mt-1">
          Let&apos;s get the word out. Describe your item and we&apos;ll keep
          looking for a match.
        </p>
      </div>
      <ItemForm type="lost" />
    </div>
  );
}
