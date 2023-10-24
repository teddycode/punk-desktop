import CollectionHomePage from "@pages/Collections/index.vue";
import CollectionDetails from "@pages/Collections/details.vue";

export const collectionRoutes = [
  {
    path: 'index',
    name: 'CollectionPage',
    component: CollectionHomePage,
  },
  {
    path: "details/:name",
    name: "CollectionDetails",
    component: CollectionDetails,
  },
];

