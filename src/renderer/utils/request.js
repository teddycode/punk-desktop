import axios from 'axios';

const baseURL =
    process.env.NODE_ENV === "development" ? "http://localhost:9090" : "http://ip:9090";

const service = axios.create({
    baseURL,
    timeout: 15000,
});

service.interceptors.request.use(
    config => {
        return config;
    },
    error => {
        console.log(error);
        return Promise.reject();
    }
);

service.interceptors.response.use(
    response => {
        if (response.status === 200) {
            return response.data;
        } else {
            Promise.reject();
        }
    },
    error => {
        console.log(error);
        return Promise.reject();
    }
);

export default service;
