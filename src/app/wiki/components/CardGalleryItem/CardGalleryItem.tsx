import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

export interface CardItem {
  id: string;
  title: string;
  imageUrl: string;
  shortDescription: string;
  longDescription: string;
}

export default function CardGalleryItem({
  item,
  onCardClickHandler,
}: {
  item: CardItem;
  onCardClickHandler: () => void;
}) {
  return (
    <button
      key={item.id}
      type="button"
      className="text-left"
      onClick={onCardClickHandler}
    >
      <Card
        data-testid="card-item"
        className="h-full hover:shadow-sm transition-shadow py-4 gap-2"
      >
        <CardHeader className="px-4 py-2">
          <CardTitle className="text-base">{item.title}</CardTitle>
          <CardDescription className="text-xs">
            {item.shortDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 py-2">
          <div className="relative w-full aspect-square overflow-hidden rounded-md border bg-muted">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-contain p-2"
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 25vw, 50vw"
            />
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
