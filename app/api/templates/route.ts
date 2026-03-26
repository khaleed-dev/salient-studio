import { NextRequest, NextResponse } from "next/server";
import { getTemplateIndex, getCategories } from "@/lib/templates";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const category = params.get("category") || undefined;
  const search = params.get("search") || undefined;
  const page = params.get("page") ? parseInt(params.get("page")!) : undefined;
  const perPage = params.get("per_page")
    ? parseInt(params.get("per_page")!)
    : undefined;

  // Special case: ?list=categories
  if (params.get("list") === "categories") {
    return NextResponse.json({
      success: true,
      data: getCategories(),
    });
  }

  const { items, total } = getTemplateIndex({
    category,
    search,
    page,
    perPage,
  });

  const effectivePage = page || 1;
  const effectivePerPage = perPage || total;

  return NextResponse.json({
    success: true,
    data: items,
    meta: {
      total,
      page: effectivePage,
      perPage: effectivePerPage,
      totalPages: Math.ceil(total / effectivePerPage),
    },
  });
}
