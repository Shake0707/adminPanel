import ArticleEdit from "@/components/ArticleEdit/ArticleEdit";

export default async function page({ params }: { params: Promise<{ id: string; type: string; }> }) {
  const { id, type } = await params;
  return <ArticleEdit id={id} type={type} />
}
