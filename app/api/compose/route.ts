import { NextRequest, NextResponse } from "next/server";
import { composeTemplates } from "@/lib/templates";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateSlugs, separator } = body;

    if (!templateSlugs || !Array.isArray(templateSlugs) || templateSlugs.length === 0) {
      return NextResponse.json(
        { success: false, error: "templateSlugs must be a non-empty array of template slug strings" },
        { status: 400 }
      );
    }

    const result = composeTemplates(templateSlugs, separator || "\n\n");

    if (result.found.length === 0) {
      return NextResponse.json(
        { success: false, error: "No matching templates found", missing: result.missing },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        content: result.content,
        templates: result.found,
        totalSections: result.found.length,
      },
      ...(result.missing.length > 0 && {
        warnings: { missingSlugs: result.missing },
      }),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}
