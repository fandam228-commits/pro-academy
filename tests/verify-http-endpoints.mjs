async function run() {
  // 1. Login as student
  const loginRes = await fetch("http://localhost:3000/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "login",
      email: "omar.student@example.com",
      password: "student123password",
      rememberMe: true,
    }),
  });
  console.log("Login HTTP Status:", loginRes.status);
  const loginData = await loginRes.json();
  console.log("Logged In User:", loginData.user?.name, "Role:", loginData.user?.role);
  const cookieHeader = loginRes.headers.get("set-cookie");
  console.log("Set-Cookie Present:", Boolean(cookieHeader));

  // Extract cookie
  let sessionCookie = "";
  if (cookieHeader) {
    const match = cookieHeader.match(/pa_session=[^;]+/);
    if (match) sessionCookie = match[0];
  }
  console.log("Extracted Cookie:", sessionCookie.slice(0, 30) + "...");

  // 2. Fetch Course Details
  const courseRes = await fetch("http://localhost:3000/api/courses?id=crs_sec_3", {
    headers: { Cookie: sessionCookie },
  });
  console.log("Courses API Status:", courseRes.status);
  const courseData = await courseRes.json();
  console.log("Course Found:", Boolean(courseData.course));
  console.log("Course Title:", courseData.course?.title);
  console.log("Course Display Price:", courseData.course?.displayPrice);
  console.log("Course Original Price:", courseData.course?.originalPrice);
  console.log("Is Enrolled:", courseData.isEnrolled);
  console.log("Units Count:", courseData.units?.length);
  console.log("Unit 1 Title:", courseData.units?.[0]?.title);
  console.log("Unit 1 Lessons Count:", courseData.units?.[0]?.lessons?.length);
  console.log("Lesson 1 Can Access:", courseData.units?.[0]?.lessons?.[0]?.isFree || courseData.isEnrolled);

  // 3. Fetch PDFs
  const pdfRes = await fetch("http://localhost:3000/api/pdfs?courseId=crs_sec_3", {
    headers: { Cookie: sessionCookie },
  });
  console.log("PDFs API Status:", pdfRes.status);
  const pdfData = await pdfRes.json();
  console.log("PDF Documents Count:", pdfData.documents?.length);

  // 4. Test Admin Role Verification
  const adminRes = await fetch("http://localhost:3000/api/admin", {
    headers: { Cookie: sessionCookie },
  });
  console.log("Student Accessing Admin API Status (Should be 403):", adminRes.status);

  // 5. Login as Admin
  const adminLoginRes = await fetch("http://localhost:3000/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "login",
      username: "habibadmin",
      password: "admin123password",
      rememberMe: true,
    }),
  });
  const adminLoginData = await adminLoginRes.json();
  console.log("Admin Login Status:", adminLoginRes.status, "Role:", adminLoginData.user?.role);
  const adminCookieHeader = adminLoginRes.headers.get("set-cookie");
  let adminSessionCookie = "";
  if (adminCookieHeader) {
    const match = adminCookieHeader.match(/pa_session=[^;]+/);
    if (match) adminSessionCookie = match[0];
  }

  // 6. Admin API with Admin Session
  const adminDataRes = await fetch("http://localhost:3000/api/admin", {
    headers: { Cookie: adminSessionCookie },
  });
  console.log("Admin Accessing Admin API Status (Should be 200):", adminDataRes.status);
  const adminData = await adminDataRes.json();
  console.log("Free Courses Settings from Admin API:", adminData.freeCoursesSettings);
}

run().catch(console.error);
