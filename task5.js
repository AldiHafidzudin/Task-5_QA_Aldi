import http from "k6/http";
import { check, sleep, group } from "k6";

// Import modul untuk membuat laporan HTML dan teks
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

// baseURL
const baseURL = "https://reqres.in";

// opsi pengujian
export const options = {
  vus: 1000,
  iterations: 3500,
  duration: "30s",
  thresholds: {
    http_req_duration: ["avg < 2000"], // Batas toleransi durasi respons API: 2 detik rata-rata
    http_req_failed: ["rate < 0.01"], // 1% tingkat kegagalan
  },
};

// Fungsi assertions untuk memeriksa kode status dan isi respons dari API
export function assertResponseCode(response, expectedStatusCode) {
  check(response, {
    [`Correct Status code is ${expectedStatusCode}`]: (res) => res.status === expectedStatusCode,
  });
}

export function assertResponseBodyPOST(postRes, fieldName, expectedValue) {
  check(postRes, {
    [`Response body field '${fieldName}' same with '${expectedValue}'`]: (res) => JSON.parse(res.body)[fieldName] === expectedValue,
  });
}

export function assertResponseBodyPUT(putRes, fieldName, expectedValue) {
  check(putRes, {
    [`Response body field '${fieldName}' same with '${expectedValue}'`]: (res) => JSON.parse(res.body)[fieldName] === expectedValue,
  });
}

// Fungsi utama untuk skenario pengujian
export default function (postRes, putRes) {
  
  group("postScenario", function () {
    // POST Request
    const postPathUrl = "/api/users";
    const postPayload = JSON.stringify({
      name: "Dummy",
      job: "leader",
    });
    const postParams = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const postRes = http.post(`${baseURL}${postPathUrl}`, postPayload, postParams);

    // Assertions untuk POST Request
    assertResponseCode(postRes, 201); //verifikasi response code
    assertResponseBodyPOST(postRes, "name", "Dummy"); //verifikasi response body 
    assertResponseBodyPOST(postRes, "job", "leader"); //verifikasi response body 
  });

  // Menunggu selama 2 detik sebelum melanjutkan ke putScenario
  sleep(2);

  // Grupkan serangkaian request API dalam putScenario
  group("putScenario", function () {
    // PUT Request
    const putPathUrl = "/api/users/2";
    const putPayload = JSON.stringify({
      name: "Dummy",
      job: "zion resident",
    });
    const putParams = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const putRes = http.put(`${baseURL}${putPathUrl}`, putPayload, putParams);

    // Assertions untuk PUT Request
    assertResponseCode(putRes, 200); //verifikasi response code 
    assertResponseBodyPUT(putRes, "name", "Dummy"); //verifikasi response body 
    assertResponseBodyPUT(putRes, "job", "zion resident"); //verifikasi response body 
  });
}

// Pembuatan laporan HTML dan tampilan teks
export function handleSummary(data) {
  return {
    "report.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
