import { NextResponse } from 'next/server';
import { PrismaClient } from "../../../../src/generated/prisma/client"
import { z } from 'zod';
import { productionOrderSchema } from '@/lib/validators';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const orders = await prisma.productionOrder.findMany({
      include: { resource: true },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = productionOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
        { status: 400 }
      );
    }
    const { orderName, status, resourceId, startTime, endTime, notes } = validation.data;
    const newOrder = await prisma.productionOrder.create({
      data: {
        orderName,
        status,
        resourceId: resourceId || null,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        notes,
      },
    });
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    const validation = productionOrderSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.format() },
        { status: 400 }
      );
    }
    const { orderName, status, resourceId, startTime, endTime, notes } = validation.data;
    const updatedOrder = await prisma.productionOrder.update({
      where: { id },
      data: {
        orderName,
        status,
        resourceId: resourceId || null,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        notes,
      },
    });
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    await prisma.productionOrder.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Order deleted' });
  } catch (error) {
    console.error('Failed to delete order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}

