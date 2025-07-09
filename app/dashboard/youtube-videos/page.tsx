import YouTubeVideosPage from "@/components/Pages/Youtube-videos";

type TSearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function page(props: { searchParams: TSearchParams }) {
  const searchParams = await props.searchParams;
  const pageCount = searchParams["page"] ?? "1";

  return <YouTubeVideosPage pageCount={pageCount} />
}
