// import isXT from "../../ui/hooks/model"
export const getConfig = async () => {
  let token;
  let res;
  res = await window.tsbApi.user.get();
  token = res.data.token;
  return {
    headers: {
      Authorization: token,
    },
  };
};
