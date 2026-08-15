import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { addJourneyDay, addJourneyItem, cleanJourneyDetails, removeJourneyDay, removeJourneyItem, updateJourneyDay, updateJourneyItem } from "@/lib/journeyEditor";
import {
  BookOpen,
  CircleHelp,
  ClipboardList,
  FilePlus2,
  ImagePlus,
  Mail,
  MessageSquare,
  Mountain,
  Pencil,
  Plus,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";

const images = [
  "/manus-storage/triund-hikers_7653a06a.jpg",
  "/manus-storage/dharamshala-valley_971eee0a.jpg",
  "/manus-storage/triund-camp_ded436f5.jpg",
  "/manus-storage/dharamshala-prayer-flags_26329188.jpg",
];
type Tour = {
  id: number;
  title: string;
  slug: string;
  category: string;
  location: string;
  duration: string;
  difficulty: string;
  priceFrom: number;
  heroImage: string;
  gallery: string[];
  shortDescription: string;
  overview: string;
  highlights: string[];
  itinerary: { day: string; title: string; description: string }[];
  inclusions: string[];
  exclusions: string[];
  isPublished: boolean;
  isFeatured: boolean;
  featureOrder: number;
};

export default function AdminPortal() {
  const [location] = useLocation();
  const view = location.split("/").pop() || "";
  const content =
    view === "tours" ? (
      <Tours />
    ) : view === "media" ? (
      <MediaLibrary />
    ) : view === "bookings" ? (
      <BookingRequests />
    ) : view === "enquiries" ? (
      <Enquiries />
    ) : view === "newsletter" ? (
      <Newsletter />
    ) : view === "blogs" ? (
      <Blogs />
    ) : view === "reviews" ? (
      <Reviews />
    ) : view === "profile" ? (
      <Profile />
    ) : view === "administrators" ? (
      <Administrators />
    ) : (
      <Overview />
    );
  return <DashboardLayout>{content}</DashboardLayout>;
}

function Heading({
  tag,
  title,
  action,
}: {
  tag: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-[.68rem] font-extrabold uppercase tracking-[.15em] text-[#e17818]">
          {tag}
        </p>
        <h1 className="display mt-2 text-4xl font-bold text-[#123d5b] sm:text-5xl">
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}

function Overview() {
  const { data } = trpc.admin.overview.useQuery();
  const cards = [
    [
      ClipboardList,
      data?.bookings.filter(x => x.status === "new").length || 0,
      "New tour requests",
    ],
    [
      MessageSquare,
      data?.enquiries.filter(x => x.status === "new").length || 0,
      "New enquiries",
    ],
    [
      Mail,
      data?.subscribers.filter(x => x.isActive).length || 0,
      "Newsletter subscribers",
    ],
    [Mountain, data?.tours.length || 0, "Managed journeys"],
  ] as const;
  return (
    <div>
      <Heading
        tag="Good day"
        title="Operations overview"
        action={
          <Button asChild className="rounded-xl bg-[#123d5b] text-xs font-bold">
            <Link href="/admin/tours">Manage journeys</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([Icon, value, label]) => (
          <div
            key={label}
            className="rounded-2xl border border-[#dfe8e8] bg-white p-5 shadow-[0_8px_22px_rgba(18,61,91,.04)]"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-[#eef4f2] text-[#e17818]">
              <Icon className="size-5" />
            </span>
            <p className="mt-6 text-3xl font-extrabold text-[#123d5b]">
              {value}
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[.09em] text-slate-500">
              {label}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Summary
          title="Latest booking requests"
          empty="No booking requests yet."
          rows={
            data?.bookings
              .slice(0, 5)
              .map(x => [
                x.guestName,
                `${x.tourTitle} · ${x.travellers} traveller${x.travellers === 1 ? "" : "s"}`,
              ]) || []
          }
        />
        <Summary
          title="Latest contact enquiries"
          empty="No enquiries yet."
          rows={data?.enquiries.slice(0, 5).map(x => [x.name, x.subject]) || []}
        />
      </div>
    </div>
  );
}
function Summary({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: string[][];
}) {
  return (
    <section className="rounded-2xl border border-[#dfe8e8] bg-white p-5">
      <h2 className="font-bold text-[#123d5b]">{title}</h2>
      <div className="mt-4 divide-y divide-[#edf0ed]">
        {rows.length ? (
          rows.map((row, i) => (
            <div key={`${row[0]}-${i}`} className="py-3">
              <p className="text-sm font-semibold text-[#123d5b]">{row[0]}</p>
              <p className="mt-1 text-xs text-slate-500">{row[1]}</p>
            </div>
          ))
        ) : (
          <p className="py-10 text-center text-sm text-slate-500">{empty}</p>
        )}
      </div>
    </section>
  );
}

function Tours() {
  const utils = trpc.useUtils();
  const { data, isLoading, isError } = trpc.tours.adminList.useQuery();
  const tours = data ?? [];
  const [editing, setEditing] = useState<Tour | null>(null);
  const [placementNote, setPlacementNote] = useState("");
  const remove = trpc.tours.delete.useMutation({
    onSuccess: () => void utils.tours.adminList.invalidate(),
  });
  const update = trpc.tours.update.useMutation({
    onSuccess: () => void utils.tours.adminList.invalidate(),
  });
  async function setHomepageRank(tour: Tour, value: string) {
    const rank = Number(value);
    try {
      if (rank === 0) {
        await update.mutateAsync({
          ...tour,
          isFeatured: false,
          featureOrder: 0,
        });
        setPlacementNote(
          `${tour.title} has been removed from homepage Top Trips.`
        );
        return;
      }
      const occupyingTour = tours.find(
        item =>
          item.id !== tour.id && item.isFeatured && item.featureOrder === rank
      );
      if (occupyingTour) {
        const oldRank =
          tour.isFeatured && tour.featureOrder >= 1 && tour.featureOrder <= 4
            ? tour.featureOrder
            : 0;
        await update.mutateAsync({
          ...occupyingTour,
          isFeatured: oldRank > 0,
          featureOrder: oldRank,
        });
      }
      await update.mutateAsync({
        ...tour,
        featureOrder: rank,
        isFeatured: true,
      });
      setPlacementNote(`${tour.title} is now homepage Top Trip #${rank}.`);
    } catch {
      setPlacementNote(
        "The homepage order could not be saved. Please try again."
      );
    }
  }
  return (
    <div>
      <Heading
        tag="Content & placement"
        title="Journeys"
        action={
          <Button
            onClick={() => setEditing(newTour())}
            className="rounded-xl bg-[#e9781c] text-xs font-bold hover:bg-[#d86b12]"
          >
            <Plus className="mr-2 size-4" /> Add journey
          </Button>
        }
      />
      {editing && (
        <TourForm original={editing} close={() => setEditing(null)} />
      )}
      <section className="overflow-hidden rounded-2xl border border-[#dfe8e8] bg-white">
        <div className="border-b border-[#edf0ed] bg-[#f8fbf9] px-4 py-4">
          <p className="text-sm font-bold text-[#123d5b]">Homepage Top Trips</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Choose exactly which journeys appear in the four homepage positions.
            Selecting a position automatically moves the current journey from
            that place.
          </p>
          {placementNote && (
            <p
              className="mt-2 text-xs font-semibold text-[#248153]"
              role="status"
            >
              {placementNote}
            </p>
          )}
        </div>
        {!isLoading && !isError && tours.map(tour => (
          <article
            key={tour.id}
            className="flex flex-col gap-3 border-b border-[#edf0ed] p-4 last:border-0 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <img
                src={tour.heroImage}
                alt=""
                className="size-12 rounded-xl object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#123d5b]">
                  {tour.title}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {tour.category} · {tour.location}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor={`homepage-rank-${tour.id}`}>
                Homepage rank for {tour.title}
              </label>
              <select
                id={`homepage-rank-${tour.id}`}
                value={
                  tour.isFeatured &&
                  tour.featureOrder >= 1 &&
                  tour.featureOrder <= 4
                    ? String(tour.featureOrder)
                    : "0"
                }
                onChange={event =>
                  void setHomepageRank(tour, event.target.value)
                }
                disabled={update.isPending}
                className="focus-ring h-8 rounded-lg border border-[#c8d9d6] bg-white px-2 text-xs font-bold text-[#123d5b]"
              >
                <option value="0">Not in Top Trips</option>
                <option value="1">Homepage Top #1</option>
                <option value="2">Homepage Top #2</option>
                <option value="3">Homepage Top #3</option>
                <option value="4">Homepage Top #4</option>
              </select>
              <Badge
                className={
                  tour.isPublished
                    ? "bg-[#dff0e5] text-[#248153] hover:bg-[#dff0e5]"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-100"
                }
              >
                {tour.isPublished ? "Live" : "Draft"}
              </Badge>
              <button
                onClick={() => setEditing(tour)}
                className="focus-ring grid size-8 place-items-center rounded-lg bg-[#eef4f2] text-[#123d5b]"
                aria-label={`Edit ${tour.title}`}
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete “${tour.title}”?`))
                    remove.mutate({ id: tour.id });
                }}
                className="focus-ring grid size-8 place-items-center rounded-lg bg-red-50 text-red-600"
                aria-label={`Delete ${tour.title}`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </article>
        ))}
        {isLoading && (
          <p className="p-12 text-center text-sm text-slate-500" role="status">
            Loading journeys…
          </p>
        )}
        {isError && (
          <p className="p-12 text-center text-sm text-slate-500" role="alert">
            Journeys could not be loaded. Refresh the page and try again.
          </p>
        )}
        {!isLoading && !isError && !tours.length && (
          <p className="p-12 text-center text-sm text-slate-500">
            Create your first journey.
          </p>
        )}
      </section>
    </div>
  );
}
function newTour(): Tour {
  return {
    id: 0,
    title: "",
    slug: "",
    category: "Trekking",
    location: "Dharamshala, Himachal Pradesh",
    duration: "2 Days / 1 Night",
    difficulty: "Easy–Moderate",
    priceFrom: 2500,
    heroImage: images[0],
    gallery: [images[0]],
    shortDescription: "",
    overview: "",
    highlights: [],
    itinerary: [{ day: "Day 1", title: "", description: "" }],
    inclusions: [],
    exclusions: [],
    isPublished: false,
    isFeatured: false,
    featureOrder: 0,
  };
}
function TourImagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const utils = trpc.useUtils();
  const { data: uploaded = [] } = trpc.media.list.useQuery();
  const upload = trpc.media.upload.useMutation({
    onSuccess: result => {
      void utils.media.list.invalidate();
      onChange(result.asset.url);
    },
  });
  async function handleFile(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      alert("Choose an image smaller than 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const [prefix, dataBase64] = result.split(",");
      const mimeType = prefix.match(/data:(image\/(?:jpeg|png|webp))/)?.[1] as
        | "image/jpeg"
        | "image/png"
        | "image/webp"
        | undefined;
      if (!mimeType || !dataBase64) {
        alert("That image could not be read.");
        return;
      }
      upload.mutate({ filename: file.name, mimeType, dataBase64 });
    };
    reader.readAsDataURL(file);
  }
  const choices = [
    ...uploaded.map(asset => ({ url: asset.url, label: asset.filename })),
    ...images
      .filter(image => !uploaded.some(asset => asset.url === image))
      .map(image => ({ url: image, label: "Built-in Himalayan photo" })),
  ];
  return (
    <div className="rounded-2xl border border-[#d7e3de] bg-[#f8fbf9] p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Label className="text-sm font-bold text-[#123d5b]">
            Main tour photo
          </Label>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            This is the photo travellers see first on the tour card and in the
            homepage Top Trips section. Upload a JPG, PNG, or WebP image up to
            1.5 MB.
          </p>
        </div>
        <label className="focus-ring inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#123d5b] px-4 text-xs font-bold text-white hover:bg-[#0b2d46]">
          <Upload className="size-3.5" />
          {upload.isPending ? "Uploading…" : "Upload photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={upload.isPending}
            onChange={event => void handleFile(event.target.files?.[0])}
          />
        </label>
      </div>
      {upload.error && (
        <p className="mt-3 text-xs font-semibold text-red-600">
          {upload.error.message}
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {choices.map(choice => (
          <button
            type="button"
            key={choice.url}
            onClick={() => onChange(choice.url)}
            className={`focus-ring overflow-hidden rounded-xl border-2 text-left transition ${choice.url === value ? "border-[#e9781c] shadow-md" : "border-transparent hover:border-[#a9c9c1]"}`}
          >
            <img
              src={choice.url}
              alt=""
              className="aspect-[4/3] w-full object-cover"
            />
            <span className="block truncate bg-white px-2 py-1.5 text-[.65rem] font-semibold text-[#436374]">
              {choice.label}
            </span>
          </button>
        ))}
        {!choices.length && (
          <div className="col-span-full grid min-h-28 place-items-center rounded-xl border border-dashed border-[#b9cec8] text-center text-xs text-slate-500">
            <ImagePlus className="mb-1 size-4" />
            Upload your first tour photo.
          </div>
        )}
      </div>
    </div>
  );
}
function TourGalleryPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const utils = trpc.useUtils();
  const { data: uploaded = [] } = trpc.media.list.useQuery();
  const upload = trpc.media.upload.useMutation({
    onSuccess: result => {
      void utils.media.list.invalidate();
      onChange(
        value.includes(result.asset.url)
          ? value
          : [...value, result.asset.url].slice(0, 10)
      );
    },
  });
  function uploadFile(file?: File) {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 1.5 * 1024 * 1024
    ) {
      alert("Choose a JPG, PNG, or WebP image smaller than 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const [prefix, dataBase64] = result.split(",");
      const mimeType = prefix.match(/data:(image\/(?:jpeg|png|webp))/)?.[1] as
        | "image/jpeg"
        | "image/png"
        | "image/webp"
        | undefined;
      if (mimeType && dataBase64)
        upload.mutate({ filename: file.name, mimeType, dataBase64 });
    };
    reader.readAsDataURL(file);
  }
  const choices = [
    ...uploaded.map(asset => ({ url: asset.url, label: asset.filename })),
    ...images
      .filter(image => !uploaded.some(asset => asset.url === image))
      .map(image => ({ url: image, label: "Built-in Himalayan photo" })),
  ];
  function move(index: number, direction: number) {
    const next = [...value];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  return (
    <div className="rounded-2xl border border-[#d7e3de] bg-[#f8fbf9] p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Label className="text-sm font-bold text-[#123d5b]">
            Tour gallery
          </Label>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Add up to 10 photos for the tour page. Select a photo below to add
            it, then use the arrows to choose the display order.
          </p>
        </div>
        <label className="focus-ring inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#123d5b] px-4 text-xs font-bold text-white hover:bg-[#0b2d46]">
          <Upload className="size-3.5" />
          {upload.isPending ? "Uploading…" : "Add from device"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={upload.isPending}
            onChange={event => uploadFile(event.target.files?.[0])}
          />
        </label>
      </div>
      {upload.error && (
        <p className="mt-3 text-xs font-semibold text-red-600">
          {upload.error.message}
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {choices.map(choice => {
          const selected = value.includes(choice.url);
          return (
            <button
              type="button"
              key={choice.url}
              onClick={() =>
                selected
                  ? onChange(value.filter(image => image !== choice.url))
                  : onChange([...value, choice.url].slice(0, 10))
              }
              className={`focus-ring overflow-hidden rounded-xl border-2 text-left transition ${selected ? "border-[#e9781c] shadow-md" : "border-transparent hover:border-[#a9c9c1]"}`}
            >
              <img
                src={choice.url}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
              <span className="block truncate bg-white px-2 py-1.5 text-[.65rem] font-semibold text-[#436374]">
                {selected ? "Added to gallery" : choice.label}
              </span>
            </button>
          );
        })}
      </div>
      {value.length > 0 && (
        <div className="mt-5 grid gap-2">
          {value.map((image, index) => (
            <div
              className="flex items-center gap-3 rounded-xl border border-[#dfe8e8] bg-white p-2"
              key={image}
            >
              <img
                src={image}
                alt=""
                className="size-12 rounded-lg object-cover"
              />
              <p className="min-w-0 flex-1 truncate text-xs font-semibold text-[#436374]">
                Photo {index + 1}
              </p>
              <button
                type="button"
                className="focus-ring rounded-md px-2 py-1 text-xs font-bold text-[#123d5b] disabled:opacity-30"
                disabled={!index}
                onClick={() => move(index, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                className="focus-ring rounded-md px-2 py-1 text-xs font-bold text-[#123d5b] disabled:opacity-30"
                disabled={index === value.length - 1}
                onClick={() => move(index, 1)}
              >
                ↓
              </button>
              <button
                type="button"
                className="focus-ring rounded-md px-2 py-1 text-xs font-bold text-red-600"
                onClick={() => onChange(value.filter(item => item !== image))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function MediaLibrary() {
  const utils = trpc.useUtils();
  const { data: assets = [] } = trpc.media.list.useQuery();
  const remove = trpc.media.remove.useMutation({
    onSuccess: () => void utils.media.list.invalidate(),
    onError: error => alert(error.message),
  });
  return (
    <div>
      <Heading tag="Visual library" title="Tour photos" />
      <p className="-mt-4 mb-7 max-w-2xl text-sm leading-6 text-slate-500">
        Upload your own tour photos here. Then choose them as the main photo or
        add them to the gallery while editing a journey.
      </p>
      <TourImagePicker value="" onChange={() => undefined} />
      <section className="mt-6 rounded-2xl border border-[#dfe8e8] bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <span>
            <h2 className="font-bold text-[#123d5b]">Your uploaded photos</h2>
            <p className="mt-1 text-xs text-slate-500">
              You can remove photos that are not currently used in a journey.
            </p>
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {assets.map(asset => (
            <div
              key={asset.id}
              className="overflow-hidden rounded-xl border border-[#e2ebe7]"
            >
              <img
                src={asset.url}
                alt={asset.filename}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="flex items-center gap-1 bg-white px-2 py-2">
                <p className="min-w-0 flex-1 truncate text-xs font-semibold text-[#436374]">
                  {asset.filename}
                </p>
                <button
                  type="button"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (
                      confirm(
                        `Remove “${asset.filename}” from the photo library?`
                      )
                    )
                      remove.mutate({ id: asset.id });
                  }}
                  className="focus-ring rounded-md px-1.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {!assets.length && (
            <p className="col-span-full py-8 text-center text-sm text-slate-500">
              No uploaded photos yet. Use “Upload photo” above to build your
              library.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
function EditorSection({
  title,
  where,
  children,
}: {
  title: string;
  where: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#d7e3de] bg-white p-4 sm:p-5">
      <div className="mb-4 border-b border-[#e6eeeb] pb-3">
        <h3 className="font-bold text-[#123d5b]">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          <span className="font-semibold text-[#e17818]">Shows in:</span>{" "}
          {where}
        </p>
      </div>
      {children}
    </section>
  );
}
function TourForm({ original, close }: { original: Tour; close: () => void }) {
  const utils = trpc.useUtils();
  const create = trpc.tours.create.useMutation({
    onSuccess: () => {
      void utils.tours.adminList.invalidate();
      close();
    },
    onError: () => setFormError("This journey was not saved. Check the tour name and main photo. If you are publishing it, also complete the short introduction, story, one highlight, one complete day plan, and included items."),
  });
  const update = trpc.tours.update.useMutation({
    onSuccess: () => {
      void utils.tours.adminList.invalidate();
      close();
    },
    onError: () => setFormError("These changes were not saved. Check the tour name and main photo. If you are publishing it, also complete the short introduction, story, one highlight, one complete day plan, and included items."),
  });
  const [tour, setTour] = useState(original);
  const [formError, setFormError] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const { highlights, itinerary, inclusions, exclusions } = cleanJourneyDetails(tour);
    if (!tour.title.trim()) {
      setFormError("Write a tour name first. Example: Triund Sunrise Trek.");
      return;
    }
    if (!tour.isPublished) {
      const payload = { title: tour.title, slug: tour.slug || makeSlug(tour.title), category: tour.category, location: tour.location, duration: tour.duration, difficulty: tour.difficulty, priceFrom: tour.priceFrom, heroImage: tour.heroImage, gallery: tour.gallery.length ? tour.gallery : [tour.heroImage], shortDescription: tour.shortDescription, overview: tour.overview, highlights, itinerary, inclusions, exclusions, isPublished: false, isFeatured: false, featureOrder: 0 };
      if (tour.id) update.mutate({ id: tour.id, ...payload }); else create.mutate(payload);
      return;
    }
    if (!itinerary.length) {
      setFormError(
        "Add one complete day plan with a day number, title, and short details before publishing."
      );
      return;
    }
    if (!highlights.length) {
      setFormError(
        "Add at least one tour highlight before publishing."
      );
      return;
    }
    if (!inclusions.length) {
      setFormError(
        "Add at least one included item before publishing."
      );
      return;
    }
    const payload = {
      title: tour.title,
      slug: tour.slug || makeSlug(tour.title),
      category: tour.category,
      location: tour.location,
      duration: tour.duration,
      difficulty: tour.difficulty,
      priceFrom: tour.priceFrom,
      heroImage: tour.heroImage,
      gallery: tour.gallery.length ? tour.gallery : [tour.heroImage],
      shortDescription: tour.shortDescription,
      overview: tour.overview,
      highlights,
      itinerary,
      inclusions,
      exclusions,
      isPublished: tour.isPublished,
      isFeatured: tour.isFeatured,
      featureOrder: tour.isFeatured
        ? Math.min(4, Math.max(1, tour.featureOrder || 1))
        : 0,
    };
    if (tour.id) update.mutate({ id: tour.id, ...payload });
    else create.mutate(payload);
  }
  return (
    <section className="mb-7 rounded-2xl border border-[#d7e3de] bg-[#f8fbf9] p-5 shadow-[0_18px_38px_rgba(18,61,91,.08)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.12em] text-[#e17818]">
            Journey editor
          </p>
          <h2 className="display mt-1 text-3xl font-bold text-[#123d5b]">
            {tour.id ? "Edit journey" : "Add journey"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Clear sections show exactly where each detail appears for
            travellers. Write naturally: tour text, highlights, daily plans, and
            blog-style notes have no word-count limit.
          </p>
          <p className="mt-3 rounded-xl border border-[#efd9bf] bg-[#fff8ef] px-3 py-2 text-xs leading-5 text-[#7c4d21]"><strong>Easy start:</strong> write a tour name and choose a photo, then press <strong>Save draft</strong>. Add the other details when you are ready to publish.</p>
        </div>
        <button
          type="button"
          onClick={close}
          className="focus-ring grid size-9 place-items-center rounded-lg bg-[#e9f1ee] text-[#123d5b]"
        >
          <X className="size-4" />
        </button>
      </div>
      <form onSubmit={submit} className="mt-6 grid gap-5">
        <EditorSection
          title="1. Basic tour details"
          where="Tour card, search results, and the top of the tour page."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <TextInput
              label="Tour name"
              value={tour.title}
              set={title =>
                setTour(x => ({ ...x, title, slug: x.slug || makeSlug(title) }))
              }
            />
            <TextInput
              label="Category"
              value={tour.category}
              set={category => setTour(x => ({ ...x, category }))}
            />
            <TextInput
              label="Location"
              value={tour.location}
              set={location => setTour(x => ({ ...x, location }))}
            />
            <TextInput
              label="Duration"
              value={tour.duration}
              set={duration => setTour(x => ({ ...x, duration }))}
            />
            <TextInput
              label="Difficulty"
              value={tour.difficulty}
              set={difficulty => setTour(x => ({ ...x, difficulty }))}
            />
            <TextInput
              label="Starting price (₹)"
              value={String(tour.priceFrom)}
              type="number"
              set={value => setTour(x => ({ ...x, priceFrom: Number(value) }))}
            />
            <TextInput
              label="Homepage Top Trips order (optional)"
              value={String(tour.featureOrder)}
              type="number"
              set={value =>
                setTour(x => ({ ...x, featureOrder: Number(value) }))
              }
            />
          </div>
          <div className="mt-5">
            <TextArea
              label="Short introduction"
              value={tour.shortDescription}
              set={shortDescription =>
                setTour(x => ({ ...x, shortDescription }))
              }
            />
          </div>
        </EditorSection>
        <EditorSection
          title="2. Main photo"
          where="The tour card and homepage Top Trips section when this journey is featured."
        >
          <TourImagePicker
            value={tour.heroImage}
            onChange={heroImage =>
              setTour(x => ({
                ...x,
                heroImage,
                gallery: x.gallery.includes(heroImage)
                  ? x.gallery
                  : [heroImage, ...x.gallery].slice(0, 10),
              }))
            }
          />
        </EditorSection>
        <EditorSection
          title="3. Tour gallery"
          where="The photo gallery on the tour detail page."
        >
          <TourGalleryPicker
            value={tour.gallery}
            onChange={gallery => setTour(x => ({ ...x, gallery }))}
          />
        </EditorSection>
        <EditorSection
          title="4. Tour story & highlights"
          where="The opening story and highlights on the tour detail page."
        >
          <div className="grid gap-5">
            <TextArea
              label="Tour story"
              value={tour.overview}
              set={overview => setTour(x => ({ ...x, overview }))}
            />
            <ItemBoxes
              label="Highlights"
              help="Write one short reason why this tour is special. Example: Sunrise views from Triund."
              placeholder="Example: Sunrise views from Triund"
              items={tour.highlights}
              addLabel="Add highlight"
              onChange={highlights => setTour(x => ({ ...x, highlights }))}
            />
          </div>
        </EditorSection>
        <EditorSection
          title="5. Day-by-day plan"
          where="The daily itinerary on the tour detail page."
        >
          <ItineraryBoxes
            items={tour.itinerary}
            onChange={itinerary => setTour(x => ({ ...x, itinerary }))}
          />
        </EditorSection>
        <EditorSection
          title="6. Included in the trip"
          where="The booking confidence section on the tour detail page."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <ItemBoxes
              label="Included"
              help="Add what the traveller receives. Example: Local mountain guide."
              placeholder="Example: Local mountain guide"
              items={tour.inclusions}
              addLabel="Add included item"
              onChange={inclusions => setTour(x => ({ ...x, inclusions }))}
            />
            <ItemBoxes
              label="Not included"
              help="Add expenses the traveller pays separately. Example: Personal insurance."
              placeholder="Example: Personal insurance"
              items={tour.exclusions}
              addLabel="Add not-included item"
              onChange={exclusions => setTour(x => ({ ...x, exclusions }))}
            />
          </div>
        </EditorSection>
        <EditorSection
          title="7. Publish & homepage"
          where="Publish when ready. After saving, use the Homepage Top Trips list below to choose the exact #1–#4 position."
        >
          <div className="flex flex-wrap items-center gap-5 text-sm font-semibold text-[#123d5b]">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={tour.isPublished}
                onChange={e =>
                  setTour(x => ({ ...x, isPublished: e.target.checked }))
                }
              />{" "}
              Publish on public website
            </label>
            <p className="flex items-center gap-2 text-xs font-medium leading-5 text-slate-500">
              <CircleHelp className="size-4 shrink-0 text-[#e17818]" />
              Save first, then choose a homepage position from the list below.
            </p>
          </div>
        </EditorSection>
        <Button
          disabled={create.isPending || update.isPending}
          className="h-11 rounded-xl bg-[#123d5b] text-xs font-bold uppercase tracking-[.1em]"
        >
          {tour.isPublished ? "Publish journey" : "Save draft"}
        </Button>
        {formError && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {formError}
          </p>
        )}
      </form>
    </section>
  );
}
function TextInput({
  label,
  value,
  set,
  type = "text",
}: {
  label: string;
  value: string;
  set: (value: string) => void;
  type?: string;
}) {
  const examples: Record<string, string> = { "Tour name": "Example: Triund Sunrise Trek", "Category": "Example: Trekking", "Location": "Example: McLeod Ganj, Dharamshala", "Duration": "Example: 2 Days / 1 Night", "Difficulty": "Example: Easy–Moderate", "Homepage Top Trips order (optional)": "Leave 0, then choose a place after saving" };
  return (
    <div>
      <Label>{label}</Label>
      <Input
        value={value}
        type={type}
        placeholder={examples[label]}
        onChange={e => set(e.target.value)}
        className="mt-2 h-10"
        required={label === "Tour name"}
      />
    </div>
  );
}
function TextArea({
  label,
  value,
  set,
}: {
  label: string;
  value: string;
  set: (value: string) => void;
}) {
  const hints: Record<string, string> = {
    "Short introduction": "Example: A guided two-day trek from Dharamshala with forest trails and a Triund sunrise.",
    "Tour story": "Example: Start in Dharamshala, walk through cedar forest, camp at Triund, and return the next day.",
    "Highlights — one per line":
      "Example: Sunrise views from Triund. Press Enter before adding the next highlight.",
    "Add one day per line: Day 1 | What happens | Short details":
      "Example: Day 1 | Dharamshala to Triund | Meet the guide, begin the walk, and settle in before sunset. Every line needs all three parts, separated by the | sign.",
    "Included — one per line":
      "Example: Local guide. Press Enter before adding the next item.",
    "Not included — one per line":
      "Example: Personal insurance. Press Enter before adding the next item.",
  };
  const hint = hints[label];
  return (
    <div>
      <div className="flex items-center gap-2">
        <Label>{label}</Label>
        {hint && (
          <details className="relative inline-flex">
            <summary
              className="focus-ring grid size-5 cursor-pointer place-items-center rounded-full text-[#e17818] [&::-webkit-details-marker]:hidden"
              aria-label={`Help for ${label}`}
            >
              <CircleHelp className="size-4" />
            </summary>
            <p className="absolute right-0 z-20 mt-2 w-72 rounded-lg bg-[#123d5b] p-3 text-xs leading-5 text-white shadow-xl">
              {hint}
            </p>
          </details>
        )}
      </div>
      <Textarea
        value={value}
        onChange={e => set(e.target.value)}
        placeholder={hint}
        className="mt-2 min-h-24"
      />
      {hint && <p className="mt-2 text-xs leading-5 text-slate-500"><strong className="text-[#123d5b]">How to write:</strong> {hint}</p>}
    </div>
  );
}

function ItemBoxes({
  label,
  help,
  placeholder,
  items,
  addLabel,
  onChange,
}: {
  label: string;
  help: string;
  placeholder: string;
  items: string[];
  addLabel: string;
  onChange: (items: string[]) => void;
}) {
  const [newItem, setNewItem] = useState("");
  function addItem() {
    const nextItems = addJourneyItem(items, newItem);
    if (nextItems === items) return;
    onChange(nextItems);
    setNewItem("");
  }
  return <div>
    <div className="flex items-center gap-2"><Label>{label}</Label><details className="relative inline-flex"><summary className="focus-ring grid size-5 cursor-pointer place-items-center rounded-full text-[#e17818] [&::-webkit-details-marker]:hidden" aria-label={`Help for ${label}`}><CircleHelp className="size-4" /></summary><p className="absolute right-0 z-20 mt-2 w-72 rounded-lg bg-[#123d5b] p-3 text-xs leading-5 text-white shadow-xl">{help}</p></details></div>
    <p className="mt-1 text-xs leading-5 text-slate-500">{help}</p>
    <div className="mt-3 grid gap-2">{items.map((item, index) => <div key={`${item}-${index}`} className="flex items-center gap-2 rounded-xl border border-[#dfe8e8] bg-white p-2"><Input aria-label={`${label} ${index + 1}`} value={item} onChange={event => onChange(updateJourneyItem(items, index, event.target.value))} className="h-9 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0" /><button type="button" onClick={() => onChange(removeJourneyItem(items, index))} className="focus-ring inline-flex h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" /> Delete</button></div>)}</div>
    {!items.length && <p className="mt-3 rounded-xl border border-dashed border-[#cbdcd6] bg-[#f8fbf9] px-3 py-3 text-xs text-slate-500">No item added yet. Use the box below, then press {addLabel}.</p>}
    <div className="mt-3 flex gap-2"><Input value={newItem} onChange={event => setNewItem(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addItem(); } }} placeholder={placeholder} className="h-10" /><Button type="button" onClick={addItem} className="h-10 shrink-0 rounded-lg bg-[#123d5b] text-xs font-bold"><Plus className="mr-1 size-4" /> {addLabel}</Button></div>
  </div>;
}

function ItineraryBoxes({ items, onChange }: { items: Tour["itinerary"]; onChange: (items: Tour["itinerary"]) => void }) {
  function addDay() { onChange(addJourneyDay(items)); }
  return <div>
    <div className="flex items-center gap-2"><Label>Day-by-day plan</Label><details className="relative inline-flex"><summary className="focus-ring grid size-5 cursor-pointer place-items-center rounded-full text-[#e17818] [&::-webkit-details-marker]:hidden" aria-label="Help for day-by-day plan"><CircleHelp className="size-4" /></summary><p className="absolute right-0 z-20 mt-2 w-72 rounded-lg bg-[#123d5b] p-3 text-xs leading-5 text-white shadow-xl">Press Add day. Write the day number, a short title, and what travellers do that day.</p></details></div>
    <p className="mt-1 text-xs leading-5 text-slate-500">Press Add day, then write the day number, a short title, and what happens. Example: Day 1 · Walk to Triund · Meet your guide and walk through forest trails.</p>
    <div className="mt-3 grid gap-3">{items.map((item, index) => <div key={`${item.day}-${index}`} className="rounded-xl border border-[#dfe8e8] bg-white p-3"><div className="mb-3 flex items-center justify-between gap-3"><p className="text-xs font-extrabold uppercase tracking-[.1em] text-[#e17818]">Day box {index + 1}</p><button type="button" onClick={() => onChange(removeJourneyDay(items, index))} className="focus-ring inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" /> Delete day</button></div><div className="grid gap-3 sm:grid-cols-[130px_1fr]"><div><Label>Day</Label><Input value={item.day} onChange={event => onChange(updateJourneyDay(items, index, { day: event.target.value }))} placeholder="Day 1" className="mt-1 h-10" /></div><div><Label>Short title</Label><Input value={item.title} onChange={event => onChange(updateJourneyDay(items, index, { title: event.target.value }))} placeholder="Example: Walk to Triund" className="mt-1 h-10" /></div></div><div className="mt-3"><Label>What happens</Label><Textarea value={item.description} onChange={event => onChange(updateJourneyDay(items, index, { description: event.target.value }))} placeholder="Example: Meet your guide and walk through forest trails to camp." className="mt-1 min-h-20" /></div></div>)}</div>
    <Button type="button" onClick={addDay} className="mt-3 h-10 rounded-lg bg-[#123d5b] text-xs font-bold"><Plus className="mr-1 size-4" /> Add day</Button>
  </div>;
}
const makeSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || `journey-${Date.now()}`;

function BookingRequests() {
  const { data = [] } = trpc.bookings.list.useQuery();
  return (
    <RecordList
      tag="Visitor requests"
      title="Booking requests"
      icon={ClipboardList}
      empty="No tour requests have arrived yet."
      records={data.map(x => ({
        title: x.guestName,
        sub: `${x.tourTitle} · ${x.travellers} traveller${x.travellers === 1 ? "" : "s"}`,
        detail: `${x.email} · ${x.phone}${x.travelDate ? ` · ${x.travelDate}` : ""}${x.message ? ` — ${x.message}` : ""}`,
        date: x.createdAt,
        status: x.status,
      }))}
    />
  );
}
function Enquiries() {
  const { data = [] } = trpc.enquiries.list.useQuery();
  return (
    <RecordList
      tag="Visitor messages"
      title="Enquiries"
      icon={MessageSquare}
      empty="No contact messages have arrived yet."
      records={data.map(x => ({
        title: x.name,
        sub: x.subject,
        detail: `${x.email}${x.phone ? ` · ${x.phone}` : ""} — ${x.message}`,
        date: x.createdAt,
        status: x.status,
      }))}
    />
  );
}
function RecordList({
  tag,
  title,
  icon: Icon,
  empty,
  records,
}: {
  tag: string;
  title: string;
  icon: typeof ClipboardList;
  empty: string;
  records: {
    title: string;
    sub: string;
    detail: string;
    date: Date;
    status: string;
  }[];
}) {
  return (
    <div>
      <Heading tag={tag} title={title} />
      <section className="overflow-hidden rounded-2xl border border-[#dfe8e8] bg-white">
        {records.length ? (
          records.map((record, i) => (
            <article
              key={`${record.title}-${i}`}
              className="flex flex-col gap-3 border-b border-[#edf0ed] p-5 last:border-0 sm:flex-row"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef4f2] text-[#e17818]">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold text-[#123d5b]">{record.title}</h2>
                  <Badge className="bg-[#eef4f2] text-[#436374] hover:bg-[#eef4f2]">
                    {record.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  {record.sub}
                </p>
                <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                  {record.detail}
                </p>
              </div>
              <time className="shrink-0 text-xs text-slate-400">
                {new Date(record.date).toLocaleString("en-IN")}
              </time>
            </article>
          ))
        ) : (
          <p className="p-12 text-center text-sm text-slate-500">{empty}</p>
        )}
      </section>
    </div>
  );
}

function Newsletter() {
  const utils = trpc.useUtils();
  const { data = [] } = trpc.newsletter.list.useQuery();
  const remove = trpc.newsletter.delete.useMutation({
    onSuccess: () => void utils.newsletter.list.invalidate(),
  });
  return (
    <div>
      <Heading tag="Audience" title="Newsletter" />
      <section className="rounded-2xl border border-[#dfe8e8] bg-white">
        <div className="flex items-center justify-between border-b border-[#edf0ed] p-5">
          <span>
            <p className="text-3xl font-extrabold text-[#123d5b]">
              {data.filter(x => x.isActive).length}
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[.1em] text-slate-500">
              Active subscribers
            </p>
          </span>
          <Mail className="size-7 text-[#e17818]" />
        </div>
        {data.map(x => (
          <div
            className="flex items-center justify-between gap-3 border-b border-[#edf0ed] px-5 py-4 last:border-0"
            key={x.id}
          >
            <span>
              <p className="text-sm font-semibold text-[#123d5b]">{x.email}</p>
              <p className="mt-1 text-xs text-slate-500">
                Joined {new Date(x.createdAt).toLocaleDateString("en-IN")}
              </p>
            </span>
            <button
              onClick={() => {
                if (confirm(`Delete ${x.email}?`)) remove.mutate({ id: x.id });
              }}
              className="focus-ring grid size-8 place-items-center rounded-lg bg-red-50 text-red-600"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        {!data.length && (
          <p className="p-12 text-center text-sm text-slate-500">
            Newsletter subscriptions will appear here.
          </p>
        )}
      </section>
    </div>
  );
}

function Blogs() {
  const utils = trpc.useUtils();
  const { data = [] } = trpc.blogs.adminList.useQuery();
  const create = trpc.blogs.create.useMutation({
    onSuccess: () => void utils.blogs.adminList.invalidate(),
  });
  const remove = trpc.blogs.delete.useMutation({
    onSuccess: () => void utils.blogs.adminList.invalidate(),
  });
  const [formOpen, setFormOpen] = useState(false);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const title = String(f.get("title"));
    create.mutate(
      {
        title,
        slug: makeSlug(title),
        excerpt: String(f.get("excerpt")),
        content: String(f.get("content")),
        coverImage: String(f.get("image")),
        author: String(f.get("author")),
        isPublished: f.get("published") === "on",
      },
      {
        onSuccess: () => {
          setFormOpen(false);
          e.currentTarget.reset();
        },
      }
    );
  }
  return (
    <div>
      <Heading
        tag="Publishing"
        title="Field notes"
        action={
          <Button
            onClick={() => setFormOpen(true)}
            className="rounded-xl bg-[#e9781c] text-xs font-bold hover:bg-[#d86b12]"
          >
            <FilePlus2 className="mr-2 size-4" /> New note
          </Button>
        }
      />
      {formOpen && (
        <SimplePostForm
          onCancel={() => setFormOpen(false)}
          onSubmit={submit}
          pending={create.isPending}
        />
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {data.map(x => (
          <article
            className="flex gap-4 rounded-2xl border border-[#dfe8e8] bg-white p-4"
            key={x.id}
          >
            <img
              src={x.coverImage}
              alt=""
              className="size-20 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex gap-2">
                <h2 className="display min-w-0 flex-1 text-2xl font-bold leading-none text-[#123d5b]">
                  {x.title}
                </h2>
                <button
                  onClick={() => {
                    if (confirm(`Delete “${x.title}”?`))
                      remove.mutate({ id: x.id });
                  }}
                  className="focus-ring grid size-8 place-items-center rounded-lg bg-red-50 text-red-600"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {x.isPublished ? "Published" : "Draft"} · {x.author}
              </p>
            </div>
          </article>
        ))}
        {!data.length && (
          <p className="col-span-full rounded-2xl border border-dashed border-[#ccd9d7] p-12 text-center text-sm text-slate-500">
            Create the first field note for the public website.
          </p>
        )}
      </div>
    </div>
  );
}
function SimplePostForm({
  onCancel,
  onSubmit,
  pending,
}: {
  onCancel: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  pending: boolean;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mb-7 grid gap-5 rounded-2xl border border-[#d7e3de] bg-white p-6"
    >
      <p className="rounded-xl border border-[#d7e3de] bg-[#f8fbf9] px-4 py-3 text-sm leading-6 text-slate-600">
        Write the note in your own style. There is no word-count limit for the
        title, summary, author name, or full note.
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        <NamedInput label="Title" name="title" />
        <NamedInput label="Author" name="author" defaultValue="Trip Himalaya" />
        <div>
          <Label>Cover photo</Label>
          <select
            name="image"
            className="mt-2 h-10 w-full rounded-lg border border-input bg-white px-3 text-sm"
          >
            {images.map(x => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <label className="mt-7 flex items-center gap-2 text-sm font-semibold text-[#123d5b]">
          <input type="checkbox" name="published" /> Publish now
        </label>
      </div>
      <NamedArea label="Short summary" name="excerpt" />
      <NamedArea label="Full note" name="content" />
      <div className="flex gap-3">
        <Button
          disabled={pending}
          className="h-11 rounded-xl bg-[#123d5b] text-xs font-bold"
        >
          Save field note
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="h-11 rounded-xl text-xs font-bold"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Reviews() {
  const utils = trpc.useUtils();
  const { data = [] } = trpc.reviews.adminList.useQuery();
  const { data: media = [] } = trpc.media.list.useQuery();
  const create = trpc.reviews.create.useMutation({
    onSuccess: () => void utils.reviews.adminList.invalidate(),
  });
  const remove = trpc.reviews.delete.useMutation({
    onSuccess: () => void utils.reviews.adminList.invalidate(),
  });
  const [open, setOpen] = useState(false);
  const reviewPhotos = Array.from(new Set([...images, ...media.map(asset => asset.url)]));
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    create.mutate(
      {
        reviewerName: String(f.get("name")),
        location: String(f.get("location")) || undefined,
        sourceLabel: String(f.get("source")) || undefined,
        reviewerImage: String(f.get("image")) || undefined,
        rating: Number(f.get("rating")),
        quote: String(f.get("quote")),
        isPublished: f.get("published") === "on",
      },
      {
        onSuccess: () => {
          setOpen(false);
          e.currentTarget.reset();
        },
      }
    );
  }
  return (
    <div>
      <Heading
        tag="Authentic feedback only"
        title="Reviews"
        action={
          <Button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-[#e9781c] text-xs font-bold hover:bg-[#d86b12]"
          >
            <Plus className="mr-2 size-4" /> Add verified review
          </Button>
        }
      />
      {open && (
        <form
          onSubmit={submit}
          className="mb-7 grid gap-5 rounded-2xl border border-[#d7e3de] bg-white p-6"
        >
          <p className="rounded-xl bg-[#f8fbf9] px-4 py-3 text-sm leading-6 text-slate-600">
            Add feedback only when it came from a real traveller. Enter their
            name, place, rating and exact words. A photo is optional.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            <NamedInput label="Traveller name" name="name" />
            <NamedInput label="Where they are from" name="location" />
            <div>
              <Label htmlFor="rating">Star rating</Label>
              <select id="rating" name="rating" defaultValue="5" className="focus-ring mt-2 h-10 w-full rounded-lg border border-input bg-white px-3 text-sm text-[#123d5b]">
                <option value="5">5 stars — Excellent</option>
                <option value="4">4 stars — Very good</option>
                <option value="3">3 stars — Good</option>
                <option value="2">2 stars — Fair</option>
                <option value="1">1 star — Poor</option>
              </select>
            </div>
            <div>
              <Label htmlFor="image">Traveller photo <span className="font-normal text-slate-400">(optional)</span></Label>
              <select id="image" name="image" className="focus-ring mt-2 h-10 w-full rounded-lg border border-input bg-white px-3 text-sm text-[#123d5b]">
                <option value="">Use initials on a simple background</option>
                {reviewPhotos.map(photo => <option key={photo} value={photo}>Choose saved photo</option>)}
              </select>
            </div>
            <NamedInput label="Feedback source (optional)" name="source" />
            <label className="mt-7 flex items-center gap-2 text-sm font-semibold text-[#123d5b]">
              <input type="checkbox" name="published" /> Publish on public site
            </label>
          </div>
          <NamedArea label="Traveller feedback" name="quote" />
          <Button
            disabled={create.isPending}
            className="h-11 rounded-xl bg-[#123d5b] text-xs font-bold"
          >
            Save verified review
          </Button>
        </form>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {data.map(x => (
          <article
            key={x.id}
            className="rounded-2xl border border-[#dfe8e8] bg-white p-5"
          >
            <div className="flex justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e8f0ed] text-sm font-extrabold text-[#123d5b]">
                  {x.reviewerImage ? <img src={x.reviewerImage} alt="" className="h-full w-full object-cover" /> : x.reviewerName.slice(0, 1).toUpperCase()}
                </div>
                <span className="min-w-0">
                  <h2 className="truncate font-bold text-[#123d5b]">{x.reviewerName}</h2>
                  <p className="mt-1 text-xs text-slate-500">{x.location || "Location not listed"} · {x.isPublished ? "Published" : "Hidden"}</p>
                  <span className="mt-1 flex gap-0.5 text-[#e17818]" aria-label={`${x.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, index) => <Star key={index} className={`size-3 ${index < x.rating ? "fill-current" : "text-slate-200"}`} />)}
                  </span>
                </span>
              </div>
              <button
                onClick={() => {
                  if (confirm("Delete this verified review?"))
                    remove.mutate({ id: x.id });
                }}
                className="focus-ring grid size-8 place-items-center rounded-lg bg-red-50 text-red-600"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">“{x.quote}”</p>
          </article>
        ))}
        {!data.length && (
          <p className="col-span-full rounded-2xl border border-dashed border-[#ccd9d7] p-12 text-center text-sm text-slate-500">
            No public feedback will appear until a real review is verified and
            added here.
          </p>
        )}
      </div>
    </div>
  );
}

function Profile() {
  const { user } = useAuth();
  const update = trpc.admin.updateProfile.useMutation();
  const [saved, setSaved] = useState(false);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    update.mutate(
      {
        name: String(f.get("name")),
        email: String(f.get("email")),
        password: String(f.get("password")) || undefined,
      },
      { onSuccess: () => setSaved(true) }
    );
  }
  return (
    <div>
      <Heading tag="Your secure account" title="My profile" />
      <form
        onSubmit={submit}
        className="max-w-2xl rounded-2xl border border-[#dfe8e8] bg-white p-6"
      >
        <div className="grid gap-5">
          <NamedInput
            label="Name shown in the admin portal"
            name="name"
            defaultValue={user?.name || ""}
          />
          <NamedInput
            label="Email address"
            name="email"
            type="email"
            defaultValue={user?.email || ""}
          />
          <div>
            <Label htmlFor="password">
              Change password{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={12}
              className="mt-2 h-11"
              placeholder="Leave blank to keep your current password"
            />
            <p className="mt-2 text-xs text-slate-500">
              For account security, new passwords need at least 12 characters.
            </p>
          </div>
        </div>
        <Button
          disabled={update.isPending}
          className="mt-7 h-11 rounded-xl bg-[#123d5b] text-xs font-bold"
        >
          Save my profile
        </Button>
        {saved && <p className="mt-3 text-sm text-[#248153]">Profile saved.</p>}
      </form>
    </div>
  );
}

function Administrators() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data = [] } = trpc.admin.admins.useQuery(undefined, {
    enabled: user?.role === "principal",
  });
  const create = trpc.admin.createAdmin.useMutation({
    onSuccess: () => void utils.admin.admins.invalidate(),
  });
  const update = trpc.admin.updateAdmin.useMutation({
    onSuccess: () => void utils.admin.admins.invalidate(),
  });
  const remove = trpc.admin.deleteAdmin.useMutation({
    onSuccess: () => void utils.admin.admins.invalidate(),
  });
  const [open, setOpen] = useState(false);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    create.mutate(
      {
        name: String(f.get("name")),
        email: String(f.get("email")),
        password: String(f.get("password")),
      },
      {
        onSuccess: () => {
          setOpen(false);
          e.currentTarget.reset();
        },
      }
    );
  }
  return (
    <div>
      <Heading
        tag="Main admin controls"
        title="Administrators"
        action={
          <Button
            onClick={() => setOpen(true)}
            className="rounded-xl bg-[#e9781c] text-xs font-bold hover:bg-[#d86b12]"
          >
            <Users className="mr-2 size-4" /> Add administrator
          </Button>
        }
      />
      {open && (
        <form
          onSubmit={submit}
          className="mb-7 grid gap-5 rounded-2xl border border-[#d7e3de] bg-white p-6 md:grid-cols-3"
        >
          <p className="text-sm leading-6 text-slate-600 md:col-span-3">
            Give a trusted team member access to manage journeys and visitor
            requests. Only the main admin can add, remove, or manage other
            administrators.
          </p>
          <NamedInput label="Full name" name="name" />
          <NamedInput label="Email address" name="email" type="email" />
          <NamedInput
            label="Temporary password"
            name="password"
            type="password"
          />
          <Button
            disabled={create.isPending}
            className="h-11 rounded-xl bg-[#123d5b] text-xs font-bold md:col-span-3"
          >
            Create administrator
          </Button>
        </form>
      )}
      <section className="overflow-hidden rounded-2xl border border-[#dfe8e8] bg-white">
        {data.map(x => (
          <article
            key={x.id}
            className="flex flex-col gap-3 border-b border-[#edf0ed] p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-[#123d5b]">
                  {x.name || "Administrator"}
                </h2>
                <Badge
                  className={
                    x.role === "principal"
                      ? "bg-[#fcebd9] text-[#bd641b] hover:bg-[#fcebd9]"
                      : "bg-[#eef4f2] text-[#436374] hover:bg-[#eef4f2]"
                  }
                >
                  {x.role === "principal" ? "Main admin" : "Administrator"}
                </Badge>
                <Badge
                  className={
                    x.isActive
                      ? "bg-[#dff0e5] text-[#248153] hover:bg-[#dff0e5]"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-100"
                  }
                >
                  {x.isActive ? "Active" : "Disabled"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">{x.email}</p>
            </span>
            {x.role === "admin" && (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() =>
                    update.mutate({ id: x.id, isActive: !x.isActive })
                  }
                  disabled={update.isPending}
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs font-bold"
                >
                  {x.isActive ? "Disable access" : "Restore access"}
                </Button>
                <Button
                  onClick={() => {
                    if (
                      confirm(
                        `Remove ${x.name || "this administrator"}? This cannot be undone.`
                      )
                    )
                      remove.mutate({ id: x.id });
                  }}
                  disabled={remove.isPending}
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            )}
          </article>
        ))}
        {!data.length && (
          <p className="p-12 text-center text-sm text-slate-500">
            Create another administrator when needed.
          </p>
        )}
      </section>
    </div>
  );
}
function NamedInput({
  label,
  name,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        minLength={type === "password" ? 12 : undefined}
        defaultValue={defaultValue}
        className="mt-2 h-10"
        required
      />
    </div>
  );
}
function NamedArea({ label, name }: { label: string; name: string }) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} className="mt-2 min-h-24" required />
    </div>
  );
}
