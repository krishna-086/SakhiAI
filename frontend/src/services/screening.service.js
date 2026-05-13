import api from "./api";

export const uploadScreeningAudio = async (
  audioBlob
) => {
  const formData = new FormData();

  formData.append(
    "audio",
    audioBlob,
    "recording.webm"
  );

  const response = await api.post(
    "/api/upload-audio",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
};