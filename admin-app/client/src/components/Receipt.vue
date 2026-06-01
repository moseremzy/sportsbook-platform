<template>
  <div id="receipt" class="receipt">
    <header>
      <h1>Taste It</h1>
      <p><strong>Phone:</strong> +234 7063131606</p>
      <p><strong>Email:</strong> support@kelvinspice.com.ng</p>
      <p><strong>Website:</strong> <a href="https://mosesfoodorderingapp.kelvinspice.com.ng" target="_blank">www.mosesfoodorderingapp.kelvinspice.com.ng/</a></p>
      <hr />
    </header>

    <section>
      <p><strong>Order ID:</strong> #{{ order.order_id }}</p>
      <p><strong>Confirmation Pin:</strong> {{ order.confirmation_pin }}</p>
      <p><strong>Date:</strong> {{ MIDDLEWARES.formatted_date(order.date_created) }}</p>
    </section>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in JSON.parse(order.items)" :key="item.name">
          <td>{{ item.name }}</td>
          <td>{{ item.quantity }}</td>
          <td>{{ formatCurrency(item.total) }}</td>
        </tr>
      </tbody>
    </table>

    <section class="summary">
      <p><strong>Subtotal:</strong> {{ formatCurrency(order.sub_total_order_cost) }}</p>
      <p><strong>Service Fee:</strong> {{ formatCurrency(admin_store.website_info.service_fee) }}</p>
      <p><strong>Total:</strong> {{ formatCurrency(order.total_order_cost) }}</p>
    </section>

    <button @click="printReceipt">Print</button>
  </div>
</template>

<script setup>
import { useAdminStore } from '@/stores/admin';
import { defineProps } from "vue";
import MIDDLEWARES from '../middlewares/middlewares';

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

const admin_store = useAdminStore();

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(value);

const printReceipt = () => {
  const receiptContent = document.getElementById("receipt").innerHTML;
  const styles = `
    <style>
      body { font-family: Arial, sans-serif; margin: 0; }
      .receipt { max-width: 300px; margin: auto; padding: 10px; }
      .receipt h1 { font-size: 16px; text-align: center; }
      .receipt p, .receipt table { margin-top: 5px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 4px; text-align: left; }
    </style>
  `;

  const newWindow = window.open("", "_blank");
  newWindow.document.write(`
    <html>
      <head>
        <title>Receipt</title>
        ${styles}
      </head>
      <body>${receiptContent}</body>
    </html>
  `);
  newWindow.document.close();
  newWindow.print();
};
</script>

<style scoped>
.receipt {
  max-width: 300px; /* Adjusted for typical thermal printer width */
  margin: auto;
  padding: 10px; /* Reduced padding */
  border: 1px solid rgb(235, 233, 233); /* No border for thermal printing */
  font-size: 12px; /* Smaller font size for better fit */
}

.receipt h1 {
  font-size: 16px; /* Slightly larger for headings */
  text-align: center;
}

.receipt p, .receipt table {
  margin-top: 5px; /* Reduced margin for compactness */
}

.receipt table {
  width: 100%; /* Full width for better use of space */
}

.receipt th, .receipt td {
  padding: 4px; /* Reduced padding for compactness */
}

.receipt th {
  background-color: #f4f4f4;
}
.receipt .summary {
  margin-top: 20px;
}
.receipt button {
  display: block;
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 20px;
}
.receipt button:hover {
  background-color: #0056b3;
}
</style>
