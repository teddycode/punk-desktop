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
import { useRouter } from 'vue-router';
import { getUserDapps } from "@js/service/dappMarket";
const state = ref(-1);
const projectList = ref([])


const router = useRouter();

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
