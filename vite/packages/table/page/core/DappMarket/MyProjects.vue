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
          <div class="table-row" v-for="project in projectList" :key="project.id">
            <div class="table-cell">{{ project.name }}</div>
            <div class="table-cell">{{ project.createTime }}</div>
            <div class="table-cell">{{ project.chain }}</div>
            <div class="table-cell">
                <span :class="{'pending': project.state === 0, 'approved': project.state === 2, 'rejected': project.state === 1 }">
    {{ project.state === 0 ? 'Pending' : project.state === 1 ? 'Rejected' : 'Approved' }}
                </span>
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
import {onMounted, ref} from 'vue';
import { getUserDapps } from "@js/service/dappMarket";

const emit = defineEmits(['viewProject']);

const state = ref(-1);
const projectList = ref([])

const submittedProjects = ref(0);
const approvedProjects = ref(0);
const pendingReviews = ref(0);

async function fetchUserDapps() {
  await getUserDapps(1, state.value).then(response=> {
    projectList.value = response.data
    submittedProjects.value = response.data.length
    for (let i=0;i<response.data.length;i++){
      if (response.data[i].state == 0){
        pendingReviews.value ++ ;
      }
      if (response.data[i].state == 2){
        approvedProjects.value ++ ;
      }
    }
  })
}

onMounted(async () => {
  await fetchUserDapps();
});

const handleRowClick = (projectId: number) => {
  emit('viewProject', projectId);
};
</script>

<style scoped>
.my-projects {
  padding: 20px;
  color: var(--primary-text);
}

.overview {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
}

.stat-card {
  background: var(--secondary-bg);
  padding: 20px;
  border-radius: 12px;
  flex: 1;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.stat-card h3 {
  margin-bottom: 10px;
  color: var(--primary-text);
  font-weight: 600;
}

.stat-card p {
  font-size: 32px;
  margin: 0;
  color: var(--primary-text);
  font-weight: bold;
}

.table-container {
  background: var(--secondary-bg);
  padding: 20px;
  border-radius: 12px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.table-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.05);
}

.table-cell {
  flex: 1;
  padding: 12px;
  text-align: left;
  color: var(--primary-text);
}

.table-cell:last-child {
  flex: none;
  width: 120px;
}

.pending {
  color: #ffa940;
  font-weight: 600;
}

.approved {
  color: #52c41a;
  font-weight: 600;
}

.rejected {
  color: #ff4d4f;
  font-weight: 600;
}

:deep(.ant-btn-link) {
  color: #1890ff;
}
</style>
