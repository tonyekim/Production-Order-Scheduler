import { NextResponse } from 'next/server';
import { PrismaClient } from "../../../../src/generated/prisma/client"
import { z } from 'zod';

const prisma = new PrismaClient();

const resourceCreateSchema = z.object({
  name: z.string().min(1),
  status: z.enum(['Available', 'Busy', 'Maintenance']).optional(),
});

const resourceUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['Available', 'Busy', 'Maintenance']).optional(),
});


export async function GET() {
  try {
    const resources = await prisma.resource.findMany();
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = resourceCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 });
    }
    const newResource = await prisma.resource.create({
      data: validation.data,
    });
    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    console.error("Failed to create resource:", error);
    return NextResponse.json({ error: "Failed to create resource" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: "Resource ID is required" }, { status: 400 });
    }
    const validation = resourceUpdateSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid input", details: validation.error.format() }, { status: 400 });
    }
    const updatedResource = await prisma.resource.update({
      where: { id },
      data: validation.data,
    });
    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error("Failed to update resource:", error);
    return NextResponse.json({ error: "Failed to update resource" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Resource ID is required" }, { status: 400 });
    }
    await prisma.resource.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Resource deleted" });
  } catch (error) {
    console.error("Failed to delete resource:", error);
    return NextResponse.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}