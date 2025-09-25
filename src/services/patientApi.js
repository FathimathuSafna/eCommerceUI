import { PATIENT_INSTANCE } from "./axiosInstance"; // using your existing instance


export const addPatient = async (patientData) => {
  try {
    console.log(patientData)
    const response = await PATIENT_INSTANCE.post("/", patientData);

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllPatients = async (page = 1, limit = 10) => {
  try {
    const response = await PATIENT_INSTANCE.get("/", {
      params: { page, limit },
    });
    console.log('getallpatients',response.data)
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const searchPatients = async (query) => {
  try {
    console.log(query)
    const response = await PATIENT_INSTANCE.get("/search", {
      params: {query },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getPatientByID = async (id) => {
  try {
    const response = await PATIENT_INSTANCE.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updatePatient = async (id, patientData) => {
  try {
    const response = await PATIENT_INSTANCE.put(`/${id}`, patientData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deletePatient = async (id) => {
  try {
    const response = await PATIENT_INSTANCE.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get appointments for a patient (with pagination)
export const getPatientAppointments = async (id, page, limit, startDate,endDate) => {
  try {
    const params = { page, limit };
    if (id) params.id = id;
    if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

    const response = await PATIENT_INSTANCE.get("/getAllAppointmnets", { params });
    console.log("patient appp",response.data);
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDashboard = async () => {
  try {
    const response = await PATIENT_INSTANCE.get(`/dashboard`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


// Add an appointment for a patient
export const addAppointment = async (appointmentData) => {
  try {
    const response = await PATIENT_INSTANCE.post(`/getAllAppointmnets`, appointmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update appointment details
export const updateAppointment = async (appointmentId, updateData) => {
  try {
    const response = await PATIENT_INSTANCE.put(`/appointments/${appointmentId}`, updateData);
    console.log("updateddd",response.data)
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete appointment
export const deleteAppointment = async (appointmentId) => {
  try {
    console.log(appointmentId)
    const response = await PATIENT_INSTANCE.delete(`/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all appointments (not just for one patient)
export const getAllAppointments = async () => {
  try {
    const response = await PATIENT_INSTANCE.get(`/appointments`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};




