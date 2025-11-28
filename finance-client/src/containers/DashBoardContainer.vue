<template>
  <section>
    <div class="search grid grid-cols-2 grid-rows-1 q-gutter-md">
      <div class="items-center">
        <Input class="q-mt-sm" :label="'Search'" rounded />
      </div>
      <div class="row q-gutter-sm items-center">
        <Input :label="'Dates'" rounded />
        <Button class="text-black" outline rounded :label="'Export CSV'" />
        <q-avatar size="36px" class="flex justify-end items-end">
          <img src="https://cdn.quasar.dev/img/avatar.png" />
        </q-avatar>
      </div>
    </div>

    <Balance
      @submit="createTransaction"
      :activeAccounts="activeAccounts.data"
      :categories="categories"
      @createCategory="createCategory"
      @deleteCategory="deleteCategory"
      :balance="goal_progress.total_balance"
      @downloadReport="downloadReport"
    />
    <Payment
      :goal="goal_progress"
      :categories="progress_categories"
      :data="progress_data"
      :paymentData="payment_types"
    />
    <DashboardGraphs
      :seriesData="transaction_stats"
      :pieChartSeriesData="account_stats"
    ></DashboardGraphs>
    <TransactionOverview
      :data="transactions"
      @deleteTransaction="deleteTransaction"
      @updateTransaction="updateTransaction"
    ></TransactionOverview>
  </section>
</template>

<script setup>
import { Cookies, useQuasar } from "quasar";
import axios from "axios";
import { accountLimit, financeServerURL, viewLimitedTransaction } from "src/boot/config";
import { Button, Input } from "src/components/atoms";
import {
  Balance,
  DashboardGraphs,
  Payment,
  TransactionOverview,
} from "src/components/organisms";
import { deleteMethod } from "src/composables/api-method/delete";
import { postMethod } from "src/composables/api-method/post";
import { putMethod } from "src/composables/api-method/put";
import {
  useSocketEvents,
  useTotalBalance,
} from "src/composables/javascript/useSocketEvents";
import { accountsApiStore } from "src/stores/accounts-api";
import { categoryApiStore } from "src/stores/category-api";
import { statsApiStore } from "src/stores/stats-api";
import { transactionApiStore } from "src/stores/transaction-api";
import { onMounted, ref } from "vue";
// globalVariables
const accountStore = accountsApiStore();
const categoryStore = categoryApiStore();
const transactionStore = transactionApiStore();
const statStore = statsApiStore();
const $q = useQuasar();

const activeAccounts = ref([]);
const current = ref(1);
const getAccountByStatus = async (page) => {
  await accountStore.getAccountsByStatus($q, true, accountLimit, page);
  activeAccounts.value = accountStore.accountsByStatus;
};

// categories
const categories = ref([]);
const getCategories = async () => {
  await categoryStore.getAllCategory($q);
  categories.value = categoryStore.category;
};

const createCategory = async (payload) => {
  await postMethod(
    financeServerURL,
    "categories",
    payload,
    $q,
    "Категория успешно создана"
  );
};

const deleteCategory = async (item) => {
  await deleteMethod(financeServerURL, "categories", item.id);
};

// transaction
const transactions = ref([]);
const getTransactions = async () => {
  await transactionStore.getAllTransaction($q, viewLimitedTransaction, 1);
  transactions.value = transactionStore.transaction;
};

const createTransaction = async (payload) => {
  await postMethod(
    financeServerURL,
    "transactions",
    payload,
    $q,
    "Транзакция создана успешно"
  );
  getTransactions();
};

const deleteTransaction = async (row) => {
  await deleteMethod(financeServerURL, "transactions", row.id);
  getTransactions();
};

const updateTransaction = async (payload, transactionID) => {
  await putMethod(financeServerURL, `transactions/${transactionID}`, payload, $q, {});
  getTransactions();
};

const downloadReport = async () => {
  try {
    const response = await axios.post(
      `${financeServerURL}transactions/export/pdf`,
      { title: "My PDF Title" },
      {
        responseType: "blob", // важно!
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("access_token")}`,
        },
      }
    );
    const file = new Blob([response.data], { type: "application/pdf" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "Transaction Report.pdf";
    link.click();

    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Ошибка при генерации PDF:", error);
  }
};

// stats
const { totalBalance, fetchTotalBalance } = useTotalBalance($q);
const refreshBalance = async () => {
  await fetchTotalBalance();
  console.log("Обновлённый баланс:", totalBalance.value);
};

const goal_progress = ref([]);
const progress_categories = ref([]);
const progress_data = ref([]);
const payment_types = ref([]);
const transaction_stats = ref([]);
const account_stats = ref([]);
const getGoalProgress = async () => {
  try {
    await statStore.getTotalBalance($q);
    goal_progress.value = statStore.goal;
    progress_categories.value = statStore.goal.categories;
    progress_data.value = statStore.goal.data;

    await statStore.getPaymentTypes($q);
    payment_types.value = statStore.payment;

    await statStore.getTransactionStats($q);
    transaction_stats.value = statStore.transaction;

    await statStore.getAccountStats($q);
    account_stats.value = statStore.account;
  } catch (error) {
    console.log(error);
  }
};

const messages = ref([]);
useSocketEvents({
  accountUpdated: () => {
    getAccountByStatus(current.value);
  },
  transactionUpdated: () => {
    getTransactions();
  },
  categoryUpdated: () => {
    getCategories();
  },
  newMessage: (msg) => messages.value.push(msg),
});

onMounted(() => {
  getAccountByStatus(current.value);
  getTransactions();
  getCategories();
  refreshBalance();
  getGoalProgress();
});
</script>
