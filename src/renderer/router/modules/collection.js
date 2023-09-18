import CollectionHomePage from "@/views/Collections/index.vue";
import CollectionDetails from "@/views/Collections/details.vue";

let collectionRoutes = [
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

export {collectionRoutes};
