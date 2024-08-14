<template>
  <div class="my-projects">
    <div class="overview">
      <div class="stat-card">
        <h3>Submitted Projects</h3>
        <p>{{ submittedProjects }}</p>
      </div>
      <div class="stat-card">
        <h3>Approved Projects</h3>
        <p>{{ approvedProjects }}</p>
      </div>
      <div class="stat-card">
        <h3>Pending Reviews</h3>
        <p>{{ pendingReviews }}</p>
      </div>
    </div>
    <div class="table-container">
      <div class="table">
        <div class="table-header">
          <div class="table-row">
            <div class="table-cell">Name</div>
            <div class="table-cell">Date Added</div>
            <div class="table-cell">Chain</div>
            <div class="table-cell">Status</div>
            <div class="table-cell">Actions</div>
          </div>
        </div>
        <div class="table-body">
          <div class="table-row" v-for="project in projects" :key="project.id">
            <div class="table-cell">{{ project.name }}</div>
            <div class="table-cell">{{ project.dateAdded }}</div>
            <div class="table-cell">{{ project.chain }}</div>
            <div class="table-cell">
              <span :class="{'pending': project.status === 'pending', 'approved': project.status === 'approved', 'rejected': project.status === 'rejected'}">{{ project.status }}</span>
            </div>
            <div class="table-cell">
              <a-button type="link" @click="handleRowClick(project.id)">View Details</a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

interface Project {
  id: number;
  name: string;
  chain: string;
  dateAdded: string;
  status: string;
}

const router = useRouter();

const submittedProjects = ref(15);
const approvedProjects = ref(10);
const pendingReviews = ref(5);

const projects = ref<Project[]>([
  {
    id: 1,
    name: 'Project 1',
    chain: 'Ethereum',
    dateAdded: '2023-01-01',
    status: 'pending',
  },
  {
    id: 2,
    name: 'Project 2',
    chain: 'Binance Smart Chain',
    dateAdded: '2023-01-02',
    status: 'approved',
  },
  {
    id: 3,
    name: 'Project 3',
    chain: 'Polygon',
    dateAdded: '2023-01-03',
    status: 'rejected',
  },
  // Add more projects as needed
]);

const handleRowClick = (projectId: number) => {
  router.push({ name: 'ProjectDetails', params: { id: projectId } });
};
</script>

<style scoped>
.my-projects {
  padding: 20px;
}

.overview {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
  margin-right: 20px;
}

.stat-card:last-child {
  margin-right: 0;
}

.stat-card h3 {
  margin-bottom: 10px;
}

.stat-card p {
  font-size: 24px;
  margin: 0;
}

.table-container {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  background: #f5f5f5;
}

.table-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.table-cell {
  flex: 1;
  padding: 12px;
  text-align: left;
}

.table-cell:last-child {
  flex: none;
  width: 120px;
}

.pending {
  color: orange;
}

.approved {
  color: green;
}

.rejected {
  color: red;
}
</style>
