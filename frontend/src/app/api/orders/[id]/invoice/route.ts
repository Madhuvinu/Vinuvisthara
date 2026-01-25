import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const LARAVEL_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    // Fetch order from Laravel API
    const orderResponse = await fetch(`${LARAVEL_API_URL}/api/orders/${orderId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      return NextResponse.json(
        { error: `Order not found: ${orderResponse.status}` },
        { status: orderResponse.status }
      );
    }

    const orderData = await orderResponse.json();
    const order = orderData;
    
    if (!order || !order.id) {
      return NextResponse.json(
        { error: 'Invalid order data received' },
        { status: 500 }
      );
    }

    // Generate PDF invoice using buffer approach
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
    });
    
    // Collect PDF chunks
    doc.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    doc.on('error', (error) => {
      throw error;
    });

    // Header
    doc.fontSize(20).text('Vinuvisthara', 50, 50);
    doc.fontSize(10).text('Traditional Indian Sarees', 50, 75);
    doc.moveDown();

    // Invoice details
    doc.fontSize(16).text('Invoice', 50, 120);
    doc.fontSize(10);
    doc.text(`Order Number: ${order.order_number || order.orderNumber || order.id}`, 50, 150);
    doc.text(`Date: ${new Date(order.createdAt || order.created_at).toLocaleDateString()}`, 50, 165);
    doc.moveDown();

    // Customer details
    doc.text('Bill To:', 50, 200);
    if (order.shippingAddress) {
      const addr = order.shippingAddress;
      if (addr.email) {
        doc.text(addr.email, 50, 215);
      }
      doc.text(addr.address || '', 50, 230);
      doc.text(`${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`, 50, 245);
      if (addr.phone) {
        doc.text(`Phone: ${addr.phone}`, 50, 260);
      }
    }
    doc.moveDown();

    // Items table
    let y = 320;
    doc.fontSize(12).text('Items', 50, y);
    y += 20;

    // Table header
    doc.fontSize(10);
    doc.text('Product', 50, y);
    doc.text('Quantity', 250, y);
    doc.text('Price', 350, y);
    doc.text('Total', 450, y);
    y += 15;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;

    // Items
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        const itemName = item.product_name || item.productName || item.title || 'Product';
        const quantity = item.quantity || 1;
        const unitPrice = parseFloat(item.price || 0);
        const total = parseFloat(item.total || unitPrice * quantity);

        doc.text(itemName, 50, y);
        doc.text(quantity.toString(), 250, y);
        doc.text(`₹${unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 350, y);
        doc.text(`₹${total.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 450, y);
        y += 20;

        if (y > 700) {
          doc.addPage();
          y = 50;
        }
      }
    }

    y += 10;
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 20;

    // Totals (prices are in rupees, not paisa)
    const subtotal = parseFloat(order.subtotal || 0);
    const shipping = parseFloat(order.shipping || 0);
    const tax = parseFloat(order.tax || 0);
    const total = parseFloat(order.total || 0);

    doc.text('Subtotal:', 350, y);
    doc.text(`₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 450, y);
    y += 20;

    if (shipping > 0) {
      doc.text('Shipping:', 350, y);
      doc.text(`₹${shipping.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 450, y);
      y += 20;
    }

    if (tax > 0) {
      doc.text('Tax (GST 18%):', 350, y);
      doc.text(`₹${tax.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 450, y);
      y += 20;
    }

    // Total (bold)
    doc.fontSize(12);
    doc.text('Total:', 350, y);
    doc.text(`₹${total.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 450, y);
    y += 30;

    // Payment status
    doc.fontSize(10);
    doc.text(`Payment Status: ${order.paymentStatus || order.payment_status || 'Pending'}`, 50, y);
    doc.text(`Order Status: ${order.status || 'Pending'}`, 50, y + 15);

    // Footer
    doc.fontSize(8).text('Thank you for your order!', 50, 750, { align: 'center' });

    doc.end();

    // Wait for PDF to complete and return buffer
    return new Promise<NextResponse>((resolve, reject) => {
      doc.on('end', () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(
            new NextResponse(pdfBuffer, {
              status: 200,
              headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="invoice-${order.order_number || order.orderNumber || order.id}.pdf"`,
                'Content-Length': pdfBuffer.length.toString(),
              },
            })
          );
        } catch (error) {
          reject(error);
        }
      });
      
      doc.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
