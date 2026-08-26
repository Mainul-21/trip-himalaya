import fs from "node:fs";

const path = "client/src/pages/AdminPortal.tsx";
let source = fs.readFileSync(path, "utf8");

source = source.replace(
`  const remove = trpc.reviews.delete.useMutation({
    onSuccess: () => void utils.reviews.adminList.invalidate(),
  });
  const [open, setOpen] = useState(false);`,
`  const remove = trpc.reviews.delete.useMutation({
    onSuccess: () => void utils.reviews.adminList.invalidate(),
  });
  const update = trpc.reviews.update.useMutation({
    onSuccess: () => void utils.reviews.adminList.invalidate(),
  });
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);`
);

source = source.replace(
`              <button
                onClick={() => {
                  if (confirm("Delete this verified review?"))
                    remove.mutate({ id: x.id });
                }}
                className="focus-ring grid size-8 place-items-center rounded-lg bg-red-50 text-red-600"
              >
                <Trash2 className="size-3.5" />
              </button>`,
`              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(editingId === x.id ? null : x.id)}
                  className="focus-ring inline-flex h-8 items-center gap-1 rounded-lg bg-[#eef4f2] px-2.5 text-xs font-bold text-[#123d5b]"
                >
                  <Pencil className="size-3.5" /> {editingId === x.id ? "Close" : "Edit"}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this verified review?"))
                      remove.mutate({ id: x.id });
                  }}
                  className="focus-ring grid size-8 place-items-center rounded-lg bg-red-50 text-red-600"
                  aria-label="Delete review"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>`
);

source = source.replace(
`            <p className="mt-4 text-sm leading-6 text-slate-600">“{x.quote}”</p>
          </article>`,
`            {editingId === x.id ? (
              <ReviewEditForm
                review={x}
                pending={update.isPending}
                onCancel={() => setEditingId(null)}
                onSave={values => update.mutate({ id: x.id, ...values }, { onSuccess: () => setEditingId(null) })}
              />
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-600">“{x.quote}”</p>
            )}
          </article>`
);

const marker = `\nfunction Profile() {`;
const component = `

type EditableReview = {
  id: number;
  reviewerName: string;
  location: string | null;
  sourceLabel: string | null;
  rating: number;
  quote: string;
  isPublished: boolean;
};

type ReviewEditValues = Omit<EditableReview, "id">;

function ReviewEditForm({
  review,
  pending,
  onCancel,
  onSave,
}: {
  review: EditableReview;
  pending: boolean;
  onCancel: () => void;
  onSave: (values: ReviewEditValues) => void;
}) {
  const [values, setValues] = useState<ReviewEditValues>({
    reviewerName: review.reviewerName,
    location: review.location,
    sourceLabel: review.sourceLabel,
    rating: review.rating,
    quote: review.quote,
    isPublished: review.isPublished,
  });
  return (
    <form
      className="mt-5 grid gap-3 rounded-xl border border-[#d7e3de] bg-[#f8fbf9] p-4"
      onSubmit={event => {
        event.preventDefault();
        onSave(values);
      }}
    >
      <p className="text-xs leading-5 text-slate-600">Edit only authentic traveller information. Public cards do not display star ratings, verification claims, or review counts.</p>
      <Input aria-label="Traveller name" value={values.reviewerName} onChange={event => setValues(current => ({ ...current, reviewerName: event.target.value }))} placeholder="Traveller name" required />
      <Input aria-label="Location" value={values.location || ""} onChange={event => setValues(current => ({ ...current, location: event.target.value }))} placeholder="Location" />
      <Input aria-label="Feedback source" value={values.sourceLabel || ""} onChange={event => setValues(current => ({ ...current, sourceLabel: event.target.value }))} placeholder="Feedback source" />
      <select aria-label="Star rating" value={values.rating} onChange={event => setValues(current => ({ ...current, rating: Number(event.target.value) }))} className="focus-ring h-10 rounded-lg border border-input bg-white px-3 text-sm text-[#123d5b]">
        {[5, 4, 3, 2, 1].map(rating => <option key={rating} value={rating}>{rating} stars</option>)}
      </select>
      <Textarea aria-label="Traveller feedback" value={values.quote} onChange={event => setValues(current => ({ ...current, quote: event.target.value }))} placeholder="Exact traveller feedback" required />
      <label className="flex items-center gap-2 text-xs font-semibold text-[#123d5b]"><input type="checkbox" checked={values.isPublished} onChange={event => setValues(current => ({ ...current, isPublished: event.target.checked }))} /> Publish this authentic feedback</label>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" disabled={pending} className="h-9 rounded-lg bg-[#123d5b] px-3 text-xs font-bold">{pending ? "Saving…" : "Save changes"}</Button>
        <Button type="button" variant="outline" onClick={onCancel} className="h-9 rounded-lg px-3 text-xs font-bold">Cancel</Button>
      </div>
    </form>
  );
}
`;
if (!source.includes("function ReviewEditForm")) source = source.replace(marker, `${component}${marker}`);

fs.writeFileSync(path, source);
