import { NextRequest, NextResponse } from "next/server";
import { getTemplateBySlug } from "@/lib/templates";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    return NextResponse.json(
      { success: false, error: "Template not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: template,
  });
}
