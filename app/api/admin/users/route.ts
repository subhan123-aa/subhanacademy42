import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminUserSchema } from "@/lib/schemas";
import { getStore, saveStore } from "@/lib/data";
import { requireAdmin } from "@/lib/request-auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const users = await getStore("users");
  return NextResponse.json({
    users: users.map(({ passwordHash: _passwordHash, ...user }) => user)
  });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return NextResponse.json({ error: admin.error }, { status: admin.status });

  try {
    const body = adminUserSchema.parse(await req.json());
    const users = await getStore("users");
    const user = users.find((item) => item.id === body.id);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
    if (typeof body.name === "string") user.name = body.name;
    if (typeof body.blocked === "boolean") user.blocked = body.blocked;
    await saveStore("users", users);
    try {
      revalidatePath("/admin");
    } catch {
      // ignore
    }
    return NextResponse.json({ message: "User updated.", user: { ...user, passwordHash: undefined } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
