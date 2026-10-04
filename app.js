/* =========================================================
   BEST SCHOLARS INTERNATIONAL SCHOOL, ZARIA
   SCHOOL MANAGEMENT SYSTEM
   app.js
   =========================================================

   FRONTEND BUILD

   Main features:
   - Student Admission Application
   - Management Approval / Rejection
   - SC Number generation
   - One-time activation code
   - 14-day activation expiry
   - Student Portal
   - Staff Portal
   - Management Portal
   - Student Passport
   - Student Documents
   - Results
   - Result Printing
   - Student Details Printing
   - Admission Letter Printing
   - Bills / Payment Status
   - Staff Management
   - School Account Details
   - Nigerian Banks / Wallets
   - Student / Staff Search
   - Portal Messaging
   - School Settings

   IMPORTANT:
   This frontend version uses localStorage for testing.

   For a real production system with multiple phones/computers,
   use a secure backend/database.
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

const DB_KEY = "best_scholars_school_database_v2";
const SESSION_KEY = "best_scholars_school_session_v2";


const defaultDatabase = {

    settings: {

        schoolName:
            "BEST SCHOLARS INTERNATIONAL SCHOOL, ZARIA",

        address:
            "Zaria, Kaduna State, Nigeria",

        phone:
            "",

        email:
            "",

        session:
            "2026/2027"

    },


    applications: [],

    students: [],

    staff: [],

    results: [],

    bills: [],

    messages: [],

    schoolAccounts: []

};


let database = loadDatabase();

let currentSession = loadSession();

let pendingActivationStudentID = null;


/* =========================================================
   LOAD DATABASE
   ========================================================= */

function loadDatabase() {

    try {

        const saved =
            localStorage.getItem(DB_KEY);

        if (!saved) {

            return JSON.parse(
                JSON.stringify(defaultDatabase)
            );

        }

        const data = JSON.parse(saved);

        return {

            ...JSON.parse(
                JSON.stringify(defaultDatabase)
            ),

            ...data

        };

    } catch (error) {

        console.error(
            "Database loading error:",
            error
        );

        return JSON.parse(
            JSON.stringify(defaultDatabase)
        );

    }

}


/* =========================================================
   SAVE DATABASE
   ========================================================= */

function saveDatabase() {

    localStorage.setItem(
        DB_KEY,
        JSON.stringify(database)
    );

}


/* =========================================================
   SESSION
   ========================================================= */

function loadSession() {

    try {

        const saved =
            localStorage.getItem(SESSION_KEY);

        return saved
            ? JSON.parse(saved)
            : null;

    } catch (error) {

        return null;

    }

}


function saveSession() {

    if (currentSession) {

        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify(currentSession)
        );

    } else {

        localStorage.removeItem(
            SESSION_KEY
        );

    }

}


/* =========================================================
   SHORTCUTS
   ========================================================= */

const $ = selector =>
    document.querySelector(selector);


const $$ = selector =>
    Array.from(
        document.querySelectorAll(selector)
    );


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /[&<>"']/g,
            character => {

                const map = {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"

                };

                return map[character];

            }
        );

}


/* =========================================================
   MONEY
   ========================================================= */

function formatMoney(amount) {

    return "₦" +
        Number(amount || 0)
            .toLocaleString("en-NG");

}


/* =========================================================
   GENERATE ID
   ========================================================= */

function generateID(prefix) {

    const random =
        Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

    return (
        prefix +
        "-" +
        new Date().getFullYear() +
        "-" +
        random
    );

}


/* =========================================================
   SHOW PAGE
   ========================================================= */

function showPage(pageID) {

    $$(".view").forEach(
        view =>
            view.classList.add("hidden")
    );


    const page =
        document.getElementById(pageID);


    if (page) {

        page.classList.remove("hidden");

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   NOTIFICATION
   ========================================================= */

function showNotice(
    element,
    message,
    type = ""
) {

    if (!element) return;


    element.className =
        "notice " + type;


    element.textContent =
        message;


    element.classList.remove(
        "hidden"
    );

}


/* =========================================================
   MODAL
   ========================================================= */

function openModal(content) {

    $("#modalContent").innerHTML =
        content;

    $("#modal").classList.remove(
        "hidden"
    );

}


function closeModal() {

    $("#modal").classList.add(
        "hidden"
    );

    $("#modalContent").innerHTML =
        "";

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeApp() {

    bindNavigation();

    bindForms();

    if ($("#closeModal")) {

        $("#closeModal").onclick =
            closeModal;

    }


    if ($("#logoutBtn")) {

        $("#logoutBtn").onclick =
            logout;

    }


    if (currentSession) {

        routeCurrentSession();

    } else {

        showPage("landingView");

    }

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function bindNavigation() {

    $$("[data-show]").forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    showPage(
                        button.dataset.show
                    );

                }
            );

        }
    );

}


/* =========================================================
   FORM EVENTS
   ========================================================= */

function bindForms() {

    if ($("#applicationForm")) {

        $("#applicationForm")
            .addEventListener(
                "submit",
                submitApplication
            );

    }


    if ($("#loginForm")) {

        $("#loginForm")
            .addEventListener(
                "submit",
                loginUser
            );

    }


    if ($("#managementLoginForm")) {

        $("#managementLoginForm")
            .addEventListener(
                "submit",
                managementLogin
            );

    }


    if ($("#activationForm")) {

        $("#activationForm")
            .addEventListener(
                "submit",
                activateStudent
            );

    }


    if ($("#copyCodeBtn")) {

        $("#copyCodeBtn")
            .addEventListener(
                "click",
                copyActivationCode
            );

    }

}


/* =========================================================
   FILE TO DATA URL
   ========================================================= */

function fileToDataURL(file) {

    if (!file) {

        return Promise.resolve("");

    }


    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                () =>
                    resolve(
                        reader.result
                    );


            reader.onerror =
                reject;


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   STUDENT APPLICATION
   ========================================================= */

async function submitApplication(event) {

    event.preventDefault();


    const form =
        event.target;


    const data =
        new FormData(form);


    const passportFile =
        data.get("passport");


    const passport =
        await fileToDataURL(
            passportFile
        );


    const email =
        String(
            data.get("email") || ""
        )
        .trim()
        .toLowerCase();


    const existing =
        database.applications
            .find(
                application =>
                    application.email ===
                    email &&
                    application.status ===
                    "Pending"
            );


    if (existing) {

        showNotice(

            $("#applicationResult"),

            "You already have a pending application.",

            "error"

        );

        return;

    }


    const application = {

        id:
            generateID("APP"),

        fullName:
            String(
                data.get("fullName") || ""
            ).trim(),

        email:

            email,

        phone:
            String(
                data.get("phone") || ""
            ).trim(),

        dob:
            data.get("dob"),

        gender:
            data.get("gender"),

        address:
            String(
                data.get("address") || ""
            ).trim(),

        className:
            String(
                data.get("className") || ""
            ).trim(),

        password:
            data.get("password"),

        passport:
            passport,

        status:
            "Pending",

        createdAt:
            new Date().toISOString()

    };


    database.applications.push(
        application
    );


    saveDatabase();


    form.reset();


    showNotice(

        $("#applicationResult"),

        "Application submitted successfully. Your Application ID is " +
        application.id +
        ". Management must approve your application before activation.",

        "success"

    );

}


/* =========================================================
   MANAGEMENT LOGIN
   ========================================================= */

function managementLogin(event) {

    event.preventDefault();


    const form =
        new FormData(
            event.target
        );


    const username =
        String(
            form.get("username") || ""
        ).trim();


    const password =
        String(
            form.get("password") || ""
        );


    /*
       FRONTEND TEST ACCOUNT ONLY.

       Production must use backend authentication.
    */

    if (
        username === "admin" &&
        password === "admin123"
    ) {

        currentSession = {

            role:
                "management",

            id:
                "MANAGEMENT-001",

            name:
                "School Management"

        };


        saveSession();


        routeCurrentSession();


    } else {

        alert(
            "Invalid Management username or password."
        );

    }

}


/* =========================================================
   STUDENT / STAFF LOGIN
   ========================================================= */

function loginUser(event) {

    event.preventDefault();


    const form =
        new FormData(
            event.target
        );


    const role =
        form.get("role");


    const loginID =
        String(
            form.get("id") || ""
        ).trim();


    const password =
        String(
            form.get("password") || ""
        );


    const records =
        role === "student"
            ? database.students
            : database.staff;


    const user =
        records.find(
            record =>
                String(
                    record.id
                ).toLowerCase() ===
                loginID.toLowerCase()
        );


    if (
        !user ||
        user.password !== password
    ) {

        showNotice(

            $("#loginMessage"),

            "Invalid ID or password.",

            "error"

        );

        return;

    }


    if (
        user.status ===
        "Removed"
    ) {

        showNotice(

            $("#loginMessage"),

            "This account has been removed by Management.",

            "error"

        );

        return;

    }


    if (
        user.status ===
        "Suspended"
    ) {

        showNotice(

            $("#loginMessage"),

            "This account has been suspended by Management.",

            "error"

        );

        return;

    }


    /*
       Approved students must activate
       before entering the portal.
    */

    if (
        role === "student" &&
        !user.activated
    ) {

        pendingActivationStudentID =
            user.id;


        prepareActivationPage(
            user
        );


        showPage(
            "activationView"
        );


        return;

    }


    currentSession = {

        role:
            role,

        id:
            user.id,

        name:
            user.fullName

    };


    saveSession();


    routeCurrentSession();

}


/* =========================================================
   ACTIVATION PAGE
   ========================================================= */

function prepareActivationPage(
    student
) {

    const box =
        $("#activationCodeBox");


    if (!box) return;


    if (
        !student.activationCode
    ) {

        box.textContent =
            "CONTACT MANAGEMENT";

        return;

    }


    box.textContent =
        student.activationCode;

}


/* =========================================================
   ACTIVATION CODE
   ========================================================= */

function generateActivationCode() {

    const letters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ";


    const numbers =
        "23456789";


    let code = "BS-";


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        code +=
            letters[
                Math.floor(
                    Math.random() *
                    letters.length
                )
            ];

    }


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        code +=
            numbers[
                Math.floor(
                    Math.random() *
                    numbers.length
                )
            ];

    }


    return code;

}


/* =========================================================
   ACTIVATION EXPIRY
   ========================================================= */

function activationExpired(
    student
) {

    if (
        !student.activationCreatedAt
    ) {

        return true;

    }


    const created =
        new Date(
            student.activationCreatedAt
        ).getTime();


    const expiration =
        created +
        (
            14 *
            24 *
            60 *
            60 *
            1000
        );


    return Date.now() >
        expiration;

}


/* =========================================================
   COPY ACTIVATION CODE
   ========================================================= */

async function copyActivationCode() {

    const student =
        database.students.find(
            item =>
                item.id ===
                pendingActivationStudentID
        );


    if (
        !student ||
        !student.activationCode
    ) {

        return;

    }


    const code =
        student.activationCode;


    try {

        await navigator.clipboard
            .writeText(code);


        /*
           After copying, hide the code.
           The code itself remains valid.
        */

        $("#activationCodeBox")
            .textContent =
            "CODE COPIED";

        $("#copyCodeBtn")
            .disabled =
            true;


        showNotice(

            $("#activationMessage"),

            "Activation code copied successfully. Enter the code in the box below.",

            "success"

        );


    } catch (error) {

        alert(
            "Copy failed. Please select the code manually."
        );

    }

}


/* =========================================================
   ACTIVATE STUDENT
   ========================================================= */

function activateStudent(event) {

    event.preventDefault();


    const form =
        new FormData(
            event.target
        );


    const enteredCode =
        String(
            form.get("code") || ""
        )
        .trim()
        .toUpperCase();


    const student =
        database.students.find(
            item =>
                item.id ===
                pendingActivationStudentID
        );


    if (!student) {

        showNotice(

            $("#activationMessage"),

            "Student record could not be found.",

            "error"

        );

        return;

    }


    if (
        student.status ===
        "Removed"
    ) {

        showNotice(

            $("#activationMessage"),

            "This student account has been removed.",

            "error"

        );

        return;

    }


    if (
        student.activationUsed
    ) {

        showNotice(

            $("#activationMessage"),

            "This activation code has already been used.",

            "error"

        );

        return;

    }


    if (
        activationExpired(
            student
        )
    ) {

        showNotice(

            $("#activationMessage"),

            "This activation code has expired. Please contact Management for a new activation code.",

            "error"

        );

        return;

    }


    if (
        enteredCode !==
        student.activationCode
    ) {

        showNotice(

            $("#activationMessage"),

            "Incorrect activation code.",

            "error"

        );

        return;

    }


    /*
       One-time activation
    */

    student.activationUsed =
        true;


    student.activated =
        true;


    student.activatedAt =
        new Date().toISOString();


    student.activationCode =
        null;


    saveDatabase();


    currentSession = {

        role:
            "student",

        id:
            student.id,

        name:
            student.fullName

    };


    saveSession();


    renderStudentDashboard();

}


/* =========================================================
   SESSION ROUTER
   ========================================================= */

function routeCurrentSession() {

    if (!currentSession) {

        showPage(
            "landingView"
        );

        return;

    }


    if ($("#logoutBtn")) {

        $("#logoutBtn")
            .classList
            .remove("hidden");

    }


    if (
        currentSession.role ===
        "management"
    ) {

        renderManagementDashboard();

    }


    else if (
        currentSession.role ===
        "student"
    ) {

        renderStudentDashboard();

    }


    else if (
        currentSession.role ===
        "staff"
    ) {

        renderStaffDashboard();

    }

}


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {

    currentSession =
        null;


    pendingActivationStudentID =
        null;


    saveSession();


    if ($("#logoutBtn")) {

        $("#logoutBtn")
            .classList
            .add("hidden");

    }


    showPage(
        "landingView"
    );

}


/* =========================================================
   CREATE SC NUMBER
   ========================================================= */

function generateStudentSCNumber() {

    const year =
        new Date()
            .getFullYear();


    let number =
        database.students.length +
        1;


    let generated =
        `BSZ/${year}/${String(number).padStart(4,"0")}`;


    while (
        database.students.some(
            student =>
                student.id ===
                generated
        )
    ) {

        number++;


        generated =
            `BSZ/${year}/${String(number).padStart(4,"0")}`;

    }


    return generated;

}


/* =========================================================
   APPROVE APPLICATION
   ========================================================= */

function approveApplication(
    applicationID
) {

    const application =
        database.applications.find(
            item =>
                item.id ===
                applicationID
        );


    if (!application) {

        alert(
            "Application not found."
        );

        return;

    }


    if (
        application.status !==
        "Pending"
    ) {

        alert(
            "This application has already been processed."
        );

        return;

    }


    const scNumber =
        generateStudentSCNumber();


    const activationCode =
        generateActivationCode();


    const student = {

        id:
            scNumber,

        applicationID:
            application.id,

        fullName:
            application.fullName,

        email:
            application.email,

        phone:
            application.phone,

        dob:
            application.dob,

        gender:
            application.gender,

        address:
            application.address,

        className:
            application.className,

        password:
            application.password,

        passport:
            application.passport,

        status:
            "Approved",

        activated:
            false,

        activationCode:
            activationCode,

        activationCreatedAt:
            new Date().toISOString(),

        activationUsed:
            false,

        documents: [],

        createdAt:
            new Date().toISOString()

    };


    database.students.push(
        student
    );


    application.status =
        "Approved";


    application.studentID =
        scNumber;


    application.activationCode =
        activationCode;


    application.approvedAt =
        new Date().toISOString();


    saveDatabase();


    alert(

        "Application approved.\n\n" +

        "Student SC Number: " +
        scNumber +
        "\n\n" +

        "Activation Code: " +
        activationCode +
        "\n\n" +

        "The activation code expires after 14 days and can only be used once."

    );


    renderManagementDashboard();

}


/* =========================================================
   REJECT APPLICATION
   ========================================================= */

function rejectApplication(
    applicationID
) {

    const application =
        database.applications.find(
            item =>
                item.id ===
                applicationID
        );


    if (!application) return;


    if (
        !confirm(
            "Are you sure you want to reject this application?"
        )
    ) {

        return;

    }


    application.status =
        "Rejected";


    application.rejectedAt =
        new Date().toISOString();


    saveDatabase();


    renderManagementDashboard();

}


/* =========================================================
   RENEW ACTIVATION CODE
   ========================================================= */

function renewActivationCode(
    studentID
) {

    const student =
        database.students.find(
            item =>
                item.id ===
                studentID
        );


    if (!student) return;


    student.activationCode =
        generateActivationCode();


    student.activationCreatedAt =
        new Date().toISOString();


    student.activationUsed =
        false;


    student.activated =
        false;


    saveDatabase();


    alert(

        "New activation code:\n\n" +
        student.activationCode +
        "\n\n" +
        "This code expires after 14 days."

    );


    renderManagementDashboard();

}


/* =========================================================
   REMOVE STUDENT
   ========================================================= */

function removeStudent(
    studentID
) {

    const student =
        database.students.find(
            item =>
                item.id ===
                studentID
        );


    if (!student) return;


    if (
        !confirm(
            `Remove ${student.fullName} from the active student list?`
        )
    ) {

        return;

    }


    student.status =
        "Removed";


    student.removedAt =
        new Date().toISOString();


    saveDatabase();


    renderManagementDashboard();

}


/* =========================================================
   RESTORE STUDENT
   ========================================================= */

function restoreStudent(
    studentID
) {

    const student =
        database.students.find(
            item =>
                item.id ===
                studentID
        );


    if (!student) return;


    student.status =
        "Approved";


    delete student.removedAt;


    saveDatabase();


    renderManagementDashboard();

}


/* =========================================================
   REMOVE STAFF
   ========================================================= */

function removeStaff(
    staffID
) {

    const staff =
        database.staff.find(
            item =>
                item.id ===
                staffID
        );


    if (!staff) return;


    if (
        !confirm(
            `Remove ${staff.fullName}?`
        )
    ) {

        return;

    }


    staff.status =
        "Removed";


    staff.removedAt =
        new Date().toISOString();


    saveDatabase();


    renderManagementDashboard();

}


/* =========================================================
   RESTORE STAFF
   ========================================================= */

function restoreStaff(
    staffID
) {

    const staff =
        database.staff.find(
            item =>
                item.id ===
                staffID
        );


    if (!staff) return;


    staff.status =
        "Active";


    delete staff.removedAt;


    saveDatabase();


    renderManagementDashboard();

}


/* =========================================================
   STUDENT DASHBOARD
   ========================================================= */

function renderStudentDashboard() {

    showPage(
        "studentView"
    );


    const student =
        database.students.find(
            item =>
                item.id ===
                currentSession.id
        );


    if (!student) {

        logout();

        return;

    }


    const results =
        database.results.filter(
            result =>
                result.studentID ===
                student.id
        );


    const bills =
        database.bills.filter(
            bill =>
                bill.studentID ===
                student.id
        );


    const messages =
        database.messages.filter(
            message =>
                message.toID ===
                student.id
        );


    const totalBills =
        bills.reduce(
            (total,bill) =>
                total +
                Number(
                    bill.amount || 0
                ),
            0
        );


    $("#studentDashboard").innerHTML = `

        <div class="dashboard-head">

            <div class="profile">

                <img
                    class="avatar"
                    src="${student.passport || "logo.png"}"
                    alt="Student Passport"
                >

                <div>

                    <h2>
                        ${escapeHTML(student.fullName)}
                    </h2>

                    <span class="pill green">
                        Active Student
                    </span>

                    <p class="muted">
                        ${escapeHTML(student.id)}
                        •
                        ${escapeHTML(student.className)}
                    </p>

                </div>

            </div>


            <button
                class="btn outline no-print"
                onclick="printStudentDetails('${student.id}')"
            >
                Print Student Details
            </button>

        </div>


        <div class="grid three">

            <div class="card stat">

                <span>
                    Published Results
                </span>

                <strong>
                    ${results.length}
                </strong>

            </div>


            <div class="card stat">

                <span>
                    Total Bills
                </span>

                <strong>
                    ${formatMoney(totalBills)}
                </strong>

            </div>


            <div class="card stat">

                <span>
                    Messages
                </span>

                <strong>
                    ${messages.length}
                </strong>

            </div>

        </div>


        <div class="grid two">


            <!-- PROFILE -->

            <div class="card">

                <div class="section-title">

                    <h3>
                        My Profile
                    </h3>

                    <button
                        class="btn secondary no-print"
                        onclick="editStudentProfile('${student.id}')"
                    >
                        Edit
                    </button>

                </div>


                <p>
                    <b>SC Number:</b>
                    ${escapeHTML(student.id)}
                </p>

                <p>
                    <b>Email:</b>
                    ${escapeHTML(student.email)}
                </p>

                <p>
                    <b>Phone:</b>
                    ${escapeHTML(student.phone)}
                </p>

                <p>
                    <b>Date of Birth:</b>
                    ${escapeHTML(student.dob)}
                </p>

                <p>
                    <b>Gender:</b>
                    ${escapeHTML(student.gender)}
                </p>

                <p>
                    <b>Address:</b>
                    ${escapeHTML(student.address)}
                </p>

            </div>


            <!-- ADMISSION -->

            <div class="card">

                <div class="section-title">

                    <h3>
                        Admission
                    </h3>

                </div>


                <p>

                    Admission Status:

                    <span class="pill green">
                        Approved
                    </span>

                </p>


                <button
                    class="btn primary"
                    onclick="printAdmissionLetter('${student.id}')"
                >
                    View / Print Admission Letter
                </button>

            </div>

        </div>


        <!-- DOCUMENTS -->

        <div
            class="card"
            style="margin-top:16px"
        >

            <div class="section-title">

                <h3>
                    My Documents
                </h3>

            </div>

            ${
                renderStudentDocuments(
                    student
                )
            }

        </div>


        <!-- RESULTS -->

        <div
            class="card"
            style="margin-top:16px"
        >

            <div class="section-title">

                <h3>
                    My Results
                </h3>

            </div>


            ${
                results.length

                ?

                `

                <div class="table-wrap">

                    <table class="table">

                        <tr>

                            <th>
                                Session
                            </th>

                            <th>
                                Term
                            </th>

                            <th>
                                Subject
                            </th>

                            <th>
                                Score
                            </th>

                            <th>
                                Grade
                            </th>

                            <th>
                                Action
                            </th>

                        </tr>


                        ${
                            results.map(
                                result => `

                                <tr>

                                    <td>
                                        ${escapeHTML(result.session)}
                                    </td>

                                    <td>
                                        ${escapeHTML(result.term)}
                                    </td>

                                    <td>
                                        ${escapeHTML(result.subject)}
                                    </td>

                                    <td>
                                        ${escapeHTML(result.score)}
                                    </td>

                                    <td>
                                        ${escapeHTML(result.grade)}
                                    </td>

                                    <td>

                                        <button
                                            class="btn secondary"
                                            onclick="printResult('${result.id}')"
                                        >
                                            Print
                                        </button>

                                    </td>

                                </tr>

                            `
                            ).join("")
                        }

                    </table>

                </div>

                `

                :

                `
                    <p class="muted">
                        No result has been published yet.
                    </p>
                `
            }

        </div>


        <!-- BILLS -->

        <div
            class="card"
            style="margin-top:16px"
        >

            <div class="section-title">

                <h3>
                    Bills & Payments
                </h3>

            </div>


            ${
                bills.length

                ?

                `

                <div class="table-wrap">

                    <table class="table">

                        <tr>

                            <th>
                                Bill
                            </th>

                            <th>
                                Amount
                            </th>

                            <th>
                                Status
                            </th>

                        </tr>


                        ${
                            bills.map(
                                bill => `

                                <tr>

                                    <td>
                                        ${escapeHTML(bill.title)}
                                    </td>

                                    <td>
                                        ${formatMoney(bill.amount)}
                                    </td>

                                    <td>

                                        <span
                                            class="pill ${
                                                bill.status === "Paid"
                                                ? "green"
                                                : bill.status === "Partial"
                                                ? "orange"
                                                : "red"
                                            }"
                                        >
                                            ${escapeHTML(bill.status)}
                                        </span>

                                    </td>

                                </tr>

                            `
                            ).join("")
                        }

                    </table>

                </div>

                `

                :

                `
                    <p class="muted">
                        No bills recorded.
                    </p>
                `
            }

        </div>


        <!-- MESSAGES -->

        <div
            class="card"
            style="margin-top:16px"
        >

            <div class="section-title">

                <h3>
                    Messages
                </h3>

            </div>


            ${
                messages.length

                ?

                messages
                    .slice()
                    .reverse()
                    .map(
                        message => `

                        <div class="doc">

                            <div>

                                <b>
                                    ${escapeHTML(message.subject)}
                                </b>

                                <div class="muted">

                                    ${escapeHTML(message.message)}

                                </div>

                            </div>


                            <small>

                                ${
                                    new Date(
                                        message.createdAt
                                    ).toLocaleString()

                                }

                            </small>

                        </div>

                    `
                    )
                    .join("")

                :

                `
                    <p class="muted">
                        No messages.
                    </p>
                `
            }

        </div>

    `;

}


/* =========================================================
   STUDENT DOCUMENTS
   ========================================================= */

function renderStudentDocuments(
    student
) {

    const documents =
        student.documents || [];


    if (!documents.length) {

        return `
            <p class="muted">
                No documents have been added to your account.
            </p>
        `;

    }


    return `

        <div class="doc-list">

            ${
                documents.map(
                    document => `

                    <div class="doc">

                        <div>

                            <b>
                                ${escapeHTML(document.name)}
                            </b>

                            <div class="muted">
                                ${escapeHTML(document.type || "Document")}
                            </div>

                        </div>


                        <button
                            class="btn secondary"
                            onclick="viewDocument('${student.id}','${document.id}')"
                        >
                            View
                        </button>

                    </div>

                `
                ).join("")
            }

        </div>

    `;

}


/* =========================================================
   VIEW DOCUMENT
   ========================================================= */

function viewDocument(
    studentID,
    documentID
) {

    const student =
        database.students.find(
            item =>
                item.id ===
                studentID
        );


    if (!student) return;


    const document =
        (student.documents || [])
            .find(
                item =>
                    item.id ===
                    documentID
            );


    if (!document) return;


    openModal(`

        <h2>
            ${escapeHTML(document.name)}
        </h2>

        ${
            document.data &&
            document.data.startsWith("data:image")

            ?

            `
                <img
                    src="${document.data}"
                    style="
                        width:100%;
                        max-height:70vh;
                        object-fit:contain;
                    "
                >
            `

            :

            `
                <p>
                    Document saved successfully.
                </p>
            `
        }

    `);

}


/* =========================================================
   EDIT STUDENT PROFILE
   ========================================================= */

function editStudentProfile(
    studentID
) {

    const student =
        database.students.find(
            item =>
                item.id ===
                studentID
        );


    if (!student) return;


    openModal(`

        <h2>
            Edit Profile
        </h2>


        <form
            id="editStudentForm"
            class="form-grid"
        >

            <input
                name="phone"
                value="${escapeHTML(student.phone)}"
                placeholder="Phone"
            >


            <input
                name="email"
                type="email"
                value="${escapeHTML(student.email)}"
                placeholder="Email"
            >


            <input
                class="full"
                name="address"
                value="${escapeHTML(student.address)}"
                placeholder="Address"
            >


            <button
                class="btn primary full"
                type="submit"
            >
                Save Changes
            </button>

        </form>

    `);


    $("#editStudentForm")
        .onsubmit =
        event => {

            event.preventDefault();


            const form =
                new FormData(
                    event.target
                );


            student.phone =
                form.get("phone");


            student.email =
                form.get("email");


            student.address =
                form.get("address");


            saveDatabase();


            closeModal();


            renderStudentDashboard();

        };

}


/* =========================================================
   STAFF DASHBOARD
   ========================================================= */

function renderStaffDashboard() {

    showPage(
        "staffView"
    );


    const staff =
        database.staff.find(
            item =>
                item.id ===
                currentSession.id
        );


    if (!staff) {

        logout();

        return;

    }


    const messages =
        database.messages.filter(
            message =>
                message.toID ===
                staff.id
        );


    $("#staffDashboard").innerHTML = `

        <div class="dashboard-head">

            <div>

                <h2>
                    Staff Dashboard
                </h2>

                <p class="muted">

                    ${escapeHTML(staff.fullName)}

                    •

                    ${escapeHTML(staff.id)}

                </p>

            </div>

        </div>


        <div class="grid two">


            <div class="card">

                <h3>
                    Staff Profile
                </h3>

                <p>
                    <b>Staff ID:</b>
                    ${escapeHTML(staff.id)}
                </p>

                <p>
                    <b>Name:</b>
                    ${escapeHTML(staff.fullName)}
                </p>

                <p>
                    <b>Email:</b>
                    ${escapeHTML(staff.email)}
                </p>

                <p>
                    <b>Phone:</b>
                    ${escapeHTML(staff.phone || "")}
                </p>

                <p>
                    <b>Position:</b>
                    ${escapeHTML(staff.position || "")}
                </p>

            </div>


            <div class="card">

                <h3>
                    Account Details
                </h3>

                <p>
                    <b>ACCOUNT NAME:</b>
                    ${escapeHTML(staff.accountName || "Not added")}
                </p>

                <p>
                    <b>ACCOUNT NUMBER:</b>
                    ${escapeHTML(staff.accountNumber || "Not added")}
                </p>

                <p>
                    <b>BANK / WALLET:</b>
                    ${escapeHTML(staff.bank || "Not added")}
                </p>

            </div>

        </div>


        <div
            class="card"
            style="margin-top:16px"
        >

            <h3>
                Messages
            </h3>

            ${
                messages.length

                ?

                messages
                    .slice()
                    .reverse()
                    .map(
                        message => `

                        <div class="doc">

                            <div>

                                <b>
                                    ${escapeHTML(message.subject)}
                                </b>

                                <p class="muted">

                                    ${escapeHTML(message.message)}

                                </p>

                            </div>

                        </div>

                    `
                    )
                    .join("")

                :

                `
                    <p class="muted">
                        No messages.
                    </p>
                `
            }

        </div>

    `;

}


/* =========================================================
   MANAGEMENT DASHBOARD
   ========================================================= */

function renderManagementDashboard() {

    showPage(
        "managementView"
    );


    const pending =
        database.applications.filter(
            item =>
                item.status ===
                "Pending"
        );


    const students =
        database.students.filter(
            item =>
                item.status !==
                "Removed"
        );


    const staff =
        database.staff.filter(
            item =>
                item.status !==
                "Removed"
        );


    $("#managementDashboard").innerHTML = `

        <div class="dashboard-head">

            <div>

                <h2>
                    Management Dashboard
                </h2>

                <p class="muted">
                    School administration control panel
                </p>

            </div>

        </div>


        <div class="grid three">

            <div class="card stat">

                <span>
                    Pending Applications
                </span>

                <strong>
                    ${pending.length}
                </strong>

            </div>


            <div class="card stat">

                <span>
                    Students
                </span>

                <strong>
                    ${students.length}
                </strong>

            </div>


            <div class="card stat">

                <span>
                    Staff
                </span>

                <strong>
                    ${staff.length}
                </strong>

            </div>

        </div>


        <div class="tabs">

            <button
                class="tab active"
                onclick="managementTab('students',this)"
            >
                Students
            </button>


            <button
                class="tab"
                onclick="managementTab('applications',this)"
            >
                Applications
            </button>


            <button
                class="tab"
                onclick="managementTab('staff',this)"
            >
                Staff
            </button>


            <button
                class="tab"
                onclick="managementTab('results',this)"
            >
                Results
            </button>


            <button
                class="tab"
                onclick="managementTab('bills',this)"
            >
                Bills
            </button>


            <button
                class="tab"
                onclick="managementTab('messages',this)"
            >
                Messages
            </button>


            <button
                class="tab"
                onclick="managementTab('accounts',this)"
            >
                Accounts
            </button>


            <button
                class="tab"
                onclick="managementTab('documents',this)"
            >
                Documents
            </button>


            <button
                class="tab"
                onclick="managementTab('settings',this)"
            >
                Settings
            </button>

        </div>


        <div id="managementContent"></div>

    `;


    managementTab(
        "students"
    );

}


/* =========================================================
   MANAGEMENT TABS
   ========================================================= */

function managementTab(
    tab,
    button
) {

    $$(".tab").forEach(
        item =>
            item.classList.remove(
                "active"
            )
    );


    if (button) {

        button.classList.add(
            "active"
        );

    }


    const content =
        $("#managementContent");


    if (!content) return;


    /* =====================================================
       STUDENTS
       ===================================================== */

    if (
        tab ===
        "students"
    ) {

        content.innerHTML = `

            <div class="card">

                <div class="section-title">

                    <h3>
                        Student Management
                    </h3>

                    <input
                        id="studentSearch"
                        style="max-width:300px"
                        placeholder="Search name or SC number"
                        oninput="searchStudents(this.value)"
                    >

                </div>


                <div
                    id="studentTable"
                ></div>

            </div>

        `;


        searchStudents("");

    }


    /* =====================================================
       APPLICATIONS
       ===================================================== */

    else if (
        tab ===
        "applications"
    ) {

        content.innerHTML = `

            <div class="card">

                <h3>
                    Admission Applications
                </h3>


                <div class="table-wrap">

                    <table class="table">

                        <tr>

                            <th>
                                Application ID
                            </th>

                            <th>
                                Name
                            </th>

                            <th>
                                Class
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Action
                            </th>

                        </tr>


                        ${
                            database.applications.length

                            ?

                            database.applications
                                .slice()
                                .reverse()
                                .map(
                                    application =>
                                        `

                                        <tr>

                                            <td>
                                                ${escapeHTML(application.id)}
                                            </td>

                                            <td>
                                                ${escapeHTML(application.fullName)}
                                            </td>

                                            <td>
                                                ${escapeHTML(application.className)}
                                            </td>

                                            <td>
                                                <span class="pill">
                                                    ${escapeHTML(application.status)}
                                                </span>
                                            </td>

                                            <td>

                                                ${
                                                    application.status === "Pending"

                                                    ?

                                                    `
                                                        <button
                                                            class="btn success"
                                                            onclick="approveApplication('${application.id}')"
                                                        >
                                                            Approve
                                                        </button>

                                                        <button
                                                            class="btn danger"
                                                            onclick="rejectApplication('${application.id}')"
                                                        >
                                                            Reject
                                                        </button>
                                                    `

                                                    :

                                                    "—"
                                                }

                                            </td>

                                        </tr>

                                    `
                                )
                                .join("")

                            :

                            `
                                <tr>
                                    <td colspan="5">
                                        No applications found.
                                    </td>
                                </tr>
                            `
                        }

                    </table>

                </div>

            </div>

        `;

    }


    /* =====================================================
       STAFF
       ===================================================== */

    else if (
        tab ===
        "staff"
    ) {

        content.innerHTML = `

            <div class="card">

                <div class="section-title">

                    <h3>
                        Staff Management
                    </h3>

                    <button
                        class="btn primary"
                        onclick="addStaff()"
                    >
                        + Add Staff
                    </button>

                </div>


                <div class="table-wrap">

                    <table class="table">

                        <tr>

                            <th>
                                Staff ID
                            </th>

                            <th>
                                Name
                            </th>

                            <th>
                                Position
                            </th>

                            <th>
                                Email
                            </th>

                            <th>
                                Account
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Action
                            </th>

                        </tr>


                        ${
                            database.staff.length

                            ?

                            database.staff
                                .map(
                                    staff =>
                                        `

                                        <tr>

                                            <td>
                                                ${escapeHTML(staff.id)}
                                            </td>

                                            <td>
                                                ${escapeHTML(staff.fullName)}
                                            </td>

                                            <td>
                                                ${escapeHTML(staff.position)}
                                            </td>

                                            <td>
                                                ${escapeHTML(staff.email)}
                                            </td>

                                            <td>
                                                ${escapeHTML(staff.bank || "—")}
                                            </td>

                                            <td>
                                                ${escapeHTML(staff.status)}
                                            </td>

                                            <td>

                                                ${
                                                    staff.status === "Removed"

                                                    ?

                                                    `
                                                        <button
                                                            class="btn success"
                                                            onclick="restoreStaff('${staff.id}')"
                                                        >
                                                            Restore
                                                        </button>
                                                    `

                                                    :

                                                    `
                                                        <button
                                                            class="btn secondary"
                                                            onclick="editStaff('${staff.id}')"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            class="btn danger"
                                                            onclick="removeStaff('${staff.id}')"
                                                        >
                                                            Remove
                                                        </button>
                                                    `
                                                }

                                            </td>

                                        </tr>

                                    `
                                )
                                .join("")

                            :

                            `
                                <tr>
                                    <td colspan="7">
                                        No staff found.
                                    </td>
                                </tr>
                            `
                        }

                    </table>

                </div>

            </div>

        `;

    }


    /* =====================================================
       RESULTS
       ===================================================== */

    else if (
        tab ===
        "results"
    ) {

        content.innerHTML = `

            <div class="card">

                <div class="section-title">

                    <h3>
                        Result Management
                    </h3>

                    <button
                        class="btn primary"
                        onclick="addResult()"
                    >
                        + Add Result
                    </button>

                </div>


                <div class="table-wrap">

                    <table class="table">

                        <tr>

                            <th>
                                Student
                            </th>

                            <th>
                                Subject
                            </th>

                            <th>
                                Score
                            </th>

                            <th>
                                Grade
                            </th>

                            <th>
                                Session
                            </th>

                            <th>
                                Action
                            </th>

                        </tr>


                        ${
                            database.results.length

                            ?

                            database.results
                                .slice()
                                .reverse()
                                .map(
                                    result =>
                                        `

                                        <tr>

                                            <td>
                                                ${escapeHTML(result.studentID)}
                                            </td>

                                            <td>
                                                ${escapeHTML(result.subject)}
                                            </td>

                                            <td>
                                                ${escapeHTML(result.score)}
                                            </td>

                                            <td>
                                                ${escapeHTML(result.grade)}
                                            </td>

                                            <td>
                                                ${escapeHTML(result.session)}
                                            </td>

                                            <td>

                                                <button
                                                    class="btn secondary"
                                                    onclick="printResult('${result.id}')"
                                                >
                                                    Print
                                                </button>

                                                <button
                                                    class="btn danger"
                                                    onclick="removeResult('${result.id}')"
                                                >
                                                    Remove
                                                </button>

                                            </td>

                                        </tr>

                                    `
                                )
                                .join("")

                            :

                            `
                                <tr>
                                    <td colspan="6">
                                        No results found.
                                    </td>
                                </tr>
                            `
                        }

                    </table>

                </div>

            </div>

        `;

    }


    /* =====================================================
       BILLS
       ===================================================== */

    else if (
        tab ===
        "bills"
    ) {

        content.innerHTML = `

            <div class="card">

                <div class="section-title">

                    <h3>
                        Student Bills & Payments
                    </h3>

                    <button
                        class="btn primary"
                        onclick="addBill()"
                    >
                        + Add Bill
                    </button>

                </div>


                <div class="table-wrap">

                    <table class="table">

                        <tr>

                            <th>
                                Student
                            </th>

                            <th>
                                Bill
                            </th>

                            <th>
                                Amount
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Action
                            </th>

                        </tr>


                        ${
                            database.bills.length

                            ?

                            database.bills
                                .slice()
                                .reverse()
                                .map(
                                    bill =>
                                        `

                                        <tr>

                                            <td>
                                                ${escapeHTML(bill.studentID)}
                                            </td>

                                            <td>
                                                ${escapeHTML(bill.title)}
                                            </td>

                                            <td>
                                                ${formatMoney(bill.amount)}
                                            </td>

                                            <td>

                                                <span
                                                    class="pill ${
                                                        bill.status === "Paid"
                                                        ? "green"
                                                        : bill.status === "Partial"
                                                        ? "orange"
                                                        : "red"
                                                    }"
                                                >
                                                    ${escapeHTML(bill.status)}
                                                </span>

                                            </td>

                                            <td>

                                                <button
                                                    class="btn secondary"
                                                    onclick="toggleBill('${bill.id}')"
                                                >
                                                    ${
                                                        bill.status === "Paid"
                                                        ? "Mark Pending"
                                                        : "Mark Paid"
                                                    }
                                                </button>

                                            </td>

                                        </tr>

                                    `
                                )
                                .join("")

                            :

                            `
                                <tr>
                                    <td colspan="5">
                                        No bills found.
                                    </td>
                                </tr>
                            `
                        }

                    </table>

                </div>

            </div>

        `;

    }


    /* =====================================================
       MESSAGES
       ===================================================== */

    else if (
        tab ===
        "messages"
    ) {

        content.innerHTML = `

            <div class="card">

                <div class="section-title">

                    <h3>
                        Messages
                    </h3>

                    <button
                        class="btn primary"
                        onclick="sendMessage()"
                    >
                        + New Message
                    </button>

                </div>


                <p class="muted">

                    Management can send portal messages
                    using Student SC Number or Staff ID.

                </p>


                <div class="table-wrap">

                    <table class="table">

                        <tr>

                            <th>
                                Recipient
                            </th>

                            <th>
                                Subject
                            </th>

                            <th>
                                Message
                            </th>

                            <th>
                                Date
                            </th>

                        </tr>


                        ${
                            database.messages.length

                            ?

                            database.messages
                                .slice()
                                .reverse()
                                .map(
                                    message =>
                                        `

                                        <tr>

                                            <td>
                                                ${escapeHTML(message.toID)}
                                            </td>

                                            <td>
                                                ${escapeHTML(message.subject)}
                                            </td>

                                            <td>
                                                ${escapeHTML(message.message)}
                                            </td>

                                            <td>
                                                ${
                                                    new Date(
                                                        message.createdAt
                                                    ).toLocaleString()
                                                }
                                            </td>

                                        </tr>

                                    `
                                )
                                .join("")

                            :

                            `
                                <tr>
                                    <td colspan="4">
                                        No messages found.
                                    </td>
                                </tr>
                            `
                        }

                    </table>

                </div>

            </div>

        `;

    }


    /* =====================================================
       ACCOUNTS
       ===================================================== */

    else if (
        tab ===
        "accounts"
    ) {

        content.innerHTML = `

            <div class="card">

                <div class="section-title">

                    <h3>
                        School Account Details
                    </h3>

                    <button
                        class="btn primary"
                        onclick="addSchoolAccount()"
                    >
                        + Add Account
                    </button>

                </div>


                ${
                    database.schoolAccounts.length

                    ?

                    database.schoolAccounts
                        .map(
                            account =>
                                `

                                <div class="doc">

                                    <div>

                                        <b>
                                            ${escapeHTML(account.name)}
                                        </b>

                                        <div class="muted">

                                            ${escapeHTML(account.number)}

                                            •

                                            ${escapeHTML(account.bank)}

                                            •

                                            ${escapeHTML(account.type)}

                                        </div>

                                    </div>


                                    <button
                                        class="btn danger"
                                        onclick="removeSchoolAccount('${account.id}')"
                                    >
                                        Remove
                                    </button>

                                </div>

                            `
                        )
                        .join("")

                    :

                    `
                        <p class="muted">
                            No school account has been added.
                        </p>
                    `
                }

            </div>

        `;

    }


    /* =====================================================
       DOCUMENTS
       ===================================================== */

    else if (
        tab ===
        "documents"
    ) {

        content.innerHTML = `

            <div class="card">

                <div class="section-title">

                    <h3>
                        Student Documents
                    </h3>

                    <button
                        class="btn primary"
                        onclick="addStudentDocument()"
                    >
                        + Add Document
                    </button>

                </div>


                <p class="muted">
                    Search a student by SC Number,
                    then upload a document.
                </p>


                <div class="table-wrap">

                    <table class="table">

                        <tr>

                            <th>
                                Student
                            </th>

                            <th>
                                Name
                            </th>

                            <th>
                                Documents
                            </th>

                            <th>
                                Action
                            </th>

                        </tr>


                        ${
                            database.students
                                .filter(
                                    student =>
                                        student.status !==
                                        "Removed"
                                )
                                .map(
                                    student =>
                                        `

                                        <tr>

                                            <td>
                                                ${escapeHTML(student.id)}
                                            </td>

                                            <td>
                                                ${escapeHTML(student.fullName)}
                                            </td>

                                            <td>
                                                ${(student.documents || []).length}
                                            </td>

                                            <td>

                                                <button
                                                    class="btn secondary"
                                                    onclick="viewStudentDocuments('${student.id}')"
                                                >
                                                    View
                                                </button>

                                                <button
                                                    class="btn primary"
                                                    onclick="addStudentDocument('${student.id}')"
                                                >
                                                    Add
                                                </button>

                                            </td>

                                        </tr>

                                    `
                                )
                                .join("")
                        }

                    </table>

                </div>

            </div>

        `;

    }


    /* =====================================================
       SETTINGS
       ===================================================== */

    else if (
        tab ===
        "settings"
    ) {

        content.innerHTML = `

            <div class="card">

                <h3>
                    School Management Settings
                </h3>


                <form
                    id="schoolSettingsForm"
                    class="form-grid"
                >

                    <input
                        name="schoolName"
                        value="${escapeHTML(database.settings.schoolName)}"
                        placeholder="School Name"
                        required
                    >


                    <input
                        name="session"
                        value="${escapeHTML(database.settings.session)}"
                        placeholder="Academic Session"
                        required
                    >


                    <input
                        name="phone"
                        value="${escapeHTML(database.settings.phone)}"
                        placeholder="School Phone"
                    >


                    <input
                        name="email"
                        value="${escapeHTML(database.settings.email)}"
                        placeholder="School Email"
                    >


                    <input
                        name="address"
                        value="${escapeHTML(database.settings.address)}"
                        placeholder="School Address"
                        class="full"
                    >


                    <button
                        class="btn primary full"
                        type="submit"
                    >
                        Save School Settings
                    </button>

                </form>

            </div>

        `;


        $("#schoolSettingsForm")
            .onsubmit =
            event => {

                event.preventDefault();


                const form =
                    new FormData(
                        event.target
                    );


                database.settings.schoolName =
                    form.get("schoolName");


                database.settings.session =
                    form.get("session");


                database.settings.phone =
                    form.get("phone");


                database.settings.email =
                    form.get("email");


                database.settings.address =
                    form.get("address");


                saveDatabase();


                alert(
                    "School settings saved successfully."
                );


                renderManagementDashboard();

            };

    }

}


/* =========================================================
   SEARCH STUDENTS
   ========================================================= */

function searchStudents(
    searchValue
) {

    const table =
        $("#studentTable");


    if (!table) return;


    const query =
        String(
            searchValue || ""
        )
        .toLowerCase()
        .trim();


    const students =
        database.students.filter(
            student => {

                if (
                    student.status ===
                    "Removed"
                ) {

                    return false;

                }


                const text =
                    (

                        student.fullName +
                        " " +
                        student.id +
                        " " +
                        student.email +
                        " " +
                        student.phone

                    ).toLowerCase();


                return text.includes(
                    query
                );

            }
        );


    table.innerHTML = `

        <div class="table-wrap">

            <table class="table">

                <tr>

                    <th>
                        SC Number
                    </th>

                    <th>
                        Name
                    </th>

                    <th>
                        Class
                    </th>

                    <th>
                        Status
                    </th>

                    <th>
                        Actions
                    </th>

                </tr>


                ${
                    students.length

                    ?

                    students.map(
                        student =>
                            `

                            <tr>

                                <td>
                                    ${escapeHTML(student.id)}
                                </td>

                                <td>
                                    ${escapeHTML(student.fullName)}
                                </td>

                                <td>
                                    ${escapeHTML(student.className)}
                                </td>

                                <td>

                                    ${
                                        student.activated

                                        ?

                                        `
                                            <span class="pill green">
                                                Active
                                            </span>
                                        `

                                        :

                                        `
                                            <span class="pill orange">
                                                Awaiting Activation
                                            </span>
                                        `
                                    }

                                </td>

                                <td>

                                    <button
                                        class="btn secondary"
                                        onclick="printStudentDetails('${student.id}')"
                                    >
                                        PDF
                                    </button>


                                    <button
                                        class="btn secondary"
                                        onclick="sendMessageTo('${student.id}')"
                                    >
                                        Message
                                    </button>


                                    ${
                                        !student.activated

                                        ?

                                        `
                                            <button
                                                class="btn secondary"
                                                onclick="renewActivationCode('${student.id}')"
                                            >
                                                New Code
                                            </button>
                                        `

                                        :

                                        ""
                                    }


                                    <button
                                        class="btn danger"
                                        onclick="removeStudent('${student.id}')"
                                    >
                                        Remove
                                    </button>

                                </td>

                            </tr>

                        `
                    ).join("")

                    :

                    `
                        <tr>

                            <td colspan="5">

                                No student found.

                            </td>

                        </tr>
                    `
                }

            </table>

        </div>

    `;

}


/* =========================================================
   ADD STAFF
   ========================================================= */

function addStaff() {

    openModal(`

        <h2>
            Add Staff
        </h2>


        <form
            id="staffForm"
            class="form-grid"
        >

            <input
                name="fullName"
                placeholder="Full Name"
                required
            >


            <input
                name="email"
                type="email"
                placeholder="Email Address"
                required
            >


            <input
                name="phone"
                placeholder="Phone Number"
            >


            <input
                name="position"
                placeholder="Position / Role"
                required
            >


            <input
                name="password"
                type="password"
                placeholder="Temporary Password"
                required
            >


            <input
                name="accountName"
                placeholder="ACCOUNT NAME"
            >


            <input
                name="accountNumber"
                placeholder="ACCOUNT NUMBER"
            >


            <select
                name="bank"
            >

                <option value="">
                    Select Bank / Wallet
                </option>

                ${getBankOptions()}

            </select>


            <button
                class="btn primary full"
                type="submit"
            >
                Create Staff Account
            </button>

        </form>

    `);


    $("#staffForm")
        .onsubmit =
        event => {

            event.preventDefault();


            const form =
                new FormData(
                    event.target
                );


            const staff = {

                id:
                    generateID("STF"),

                fullName:
                    form.get("fullName"),

                email:
                    form.get("email"),

                phone:
                    form.get("phone"),

                position:
                    form.get("position"),

                password:
                    form.get("password"),

                accountName:
                    form.get("accountName"),

                accountNumber:
                    form.get("accountNumber"),

                bank:
                    form.get("bank"),

                status:
                    "Active",

                createdAt:
                    new Date().toISOString()

            };


            database.staff.push(
                staff
            );


            saveDatabase();


            alert(

                "Staff account created successfully.\n\n" +

                "Staff ID: " +
                staff.id

            );


            closeModal();


            renderManagementDashboard();

        };

}


/* =========================================================
   EDIT STAFF
   ========================================================= */

function editStaff(
    staffID
) {

    const staff =
        database.staff.find(
            item =>
                item.id ===
                staffID
        );


    if (!staff) return;


    openModal(`

        <h2>
            Edit Staff
        </h2>


        <form
            id="editStaffForm"
            class="form-grid"
        >

            <input
                name="fullName"
                value="${escapeHTML(staff.fullName)}"
                placeholder="Full Name"
                required
            >


            <input
                name="email"
                type="email"
                value="${escapeHTML(staff.email)}"
                placeholder="Email"
                required
            >


            <input
                name="phone"
                value="${escapeHTML(staff.phone || "")}"
                placeholder="Phone"
            >


            <input
                name="position"
                value="${escapeHTML(staff.position || "")}"
                placeholder="Position"
                required
            >


            <input
                name="accountName"
                value="${escapeHTML(staff.accountName || "")}"
                placeholder="ACCOUNT NAME"
            >


            <input
                name="accountNumber"
                value="${escapeHTML(staff.accountNumber || "")}"
                placeholder="ACCOUNT NUMBER"
            >


            <select name="bank">

                <option value="">
                    Select Bank / Wallet
                </option>

                ${getBankOptions(staff.bank)}

            </select>


            <select
                name="status"
            >

                <option
                    ${staff.status === "Active" ? "selected" : ""}
                >
                    Active
                </option>

                <option
                    ${staff.status === "Suspended" ? "selected" : ""}
                >
                    Suspended
                </option>

                <option
                    ${staff.status === "Removed" ? "selected" : ""}
                >
                    Removed
                </option>

            </select>


            <button
                class="btn primary full"
                type="submit"
            >
                Save Staff
            </button>

        </form>

    `);


    $("#editStaffForm")
        .onsubmit =
        event => {

            event.preventDefault();


            const form =
                new FormData(
                    event.target
                );


            staff.fullName =
                form.get("fullName");


            staff.email =
                form.get("email");


            staff.phone =
                form.get("phone");


            staff.position =
                form.get("position");


            staff.accountName =
                form.get("accountName");


            staff.accountNumber =
                form.get("accountNumber");


            staff.bank =
                form.get("bank");


            staff.status =
                form.get("status");


            saveDatabase();


            closeModal();


            renderManagementDashboard();

        };

}


/* =========================================================
   NIGERIAN BANKS / WALLETS
   ========================================================= */

const NigerianBanksAndWallets = [

    "Access Bank",

    "ALAT by Wema",

    "Citibank Nigeria",

    "Ecobank Nigeria",

    "Fidelity Bank",

    "First Bank of Nigeria",

    "First City Monument Bank (FCMB)",

    "Globus Bank",

    "Guaranty Trust Bank (GTBank)",

    "Heritage Bank",

    "Jaiz Bank",

    "Keystone Bank",

    "Kuda",

    "Lotus Bank",

    "Moniepoint",

    "Nova Merchant Bank",

    "OPay",

    "PalmPay",

    "Parallex Bank",

    "Polaris Bank",

    "Premium Trust Bank",

    "Providus Bank",

    "Stanbic IBTC Bank",

    "Standard Chartered Bank Nigeria",

    "Sterling Bank",

    "SunTrust Bank",

    "TAJBank",

    "Titan Trust Bank",

    "UBA",

    "Union Bank",

    "Unity Bank",

    "Wema Bank",

    "Zenith Bank"

];


function getBankOptions(
    selected = ""
) {

    return NigerianBanksAndWallets
        .slice()
        .sort(
            (a,b) =>
                a.localeCompare(b)
        )
        .map(
            bank => `

                <option
                    value="${escapeHTML(bank)}"
                    ${
                        bank === selected
                        ? "selected"
                        : ""
                    }
                >
                    ${escapeHTML(bank)}
                </option>

            `
        )
        .join("");

}


/* =========================================================
   ADD RESULT
   ========================================================= */

function addResult() {

    openModal(`

        <h2>
            Add Student Result
        </h2>


        <form
            id="resultForm"
            class="form-grid"
        >

            <input
                name="studentID"
                placeholder="Student SC Number"
                required
            >


            <input
                name="subject"
                placeholder="Subject"
                required
            >


            <input
                name="ca"
                type="number"
                min="0"
                max="40"
                placeholder="CA Score (0 - 40)"
                required
            >


            <input
                name="exam"
                type="number"
                min="0"
                max="60"
                placeholder="Exam Score (0 - 60)"
                required
            >


            <input
                name="term"
                placeholder="Term"
                value="First Term"
                required
            >


            <input
                name="session"
                placeholder="Academic Session"
                value="${escapeHTML(database.settings.session)}"
                required
            >


            <button
                class="btn primary full"
                type="submit"
            >
                Publish Result
            </button>

        </form>

    `);


    $("#resultForm")
        .onsubmit =
        event => {

            event.preventDefault();


            const form =
                new FormData(
                    event.target
                );


            const studentID =
                String(
                    form.get("studentID")
                ).trim();


            const student =
                database.students.find(
                    item =>
                        item.id.toLowerCase() ===
                        studentID.toLowerCase()
                );


            if (!student) {

                alert(
                    "Student SC Number not found."
                );

                return;

            }


            const ca =
                Number(
                    form.get("ca")
                );


            const exam =
                Number(
                    form.get("exam")
                );


            if (
                ca < 0 ||
                ca > 40 ||
                exam < 0 ||
                exam > 60
            ) {

                alert(
                    "CA must be between 0 and 40, and Exam must be between 0 and 60."
                );

                return;

            }


            const total =
                ca + exam;


            const result = {

                id:
                    generateID("RES"),

                studentID:
                    student.id,

                subject:
                    form.get("subject"),

                ca:
                    ca,

                exam:
                    exam,

                score:
                    total,

                grade:
                    calculateGrade(
                        total
                    ),

                term:
                    form.get("term"),

                session:
                    form.get("session"),

                published:
                    true,

                createdAt:
                    new Date().toISOString()

            };


            database.results.push(
                result
            );


            saveDatabase();


            alert(
                "Result published successfully."
            );


            closeModal();


            renderManagementDashboard();

        };

}


/* =========================================================
   GRADE
   ========================================================= */

function calculateGrade(
    score
) {

    if (score >= 80)
        return "A";

    if (score >= 70)
        return "B";

    if (score >= 60)
        return "C";

    if (score >= 50)
        return "D";

    if (score >= 40)
        return "E";

    return "F";

}


/* =========================================================
   REMOVE RESULT
   ========================================================= */

function removeResult(
    resultID
) {

    const result =
        database.results.find(
            item =>
                item.id ===
                resultID
        );


    if (!result) return;


    if (
        !confirm(
            "Are you sure you want to remove this published result?"
        )
    ) {

        return;

    }


    database.results =
        database.results.filter(
            item =>
                item.id !==
                resultID
        );


    saveDatabase();


    renderManagementDashboard();

}


/* =========================================================
   ADD BILL
   ========================================================= */

function addBill() {

    openModal(`

        <h2>
            Add Student Bill
        </h2>


        <form
            id="billForm"
            class="form-grid"
        >

            <input
                name="studentID"
                placeholder="Student SC Number"
                required
            >


            <input
                name="title"
                placeholder="Bill Title"
                required
            >


            <input
                name="amount"
                type="number"
                min="0"
                placeholder="Amount"
                required
            >


            <select name="status">

                <option>
                    Pending
                </option>

                <option>
                    Paid
                </option>

                <option>
                    Partial
                </option>

            </select>


            <button
                class="btn primary full"
                type="submit"
            >
                Add Bill
            </button>

        </form>

    `);


    $("#billForm")
        .onsubmit =
        event => {

            event.preventDefault();


            const form =
                new FormData(
                    event.target
                );


            const studentID =
                String(
                    form.get("studentID")
                ).trim();


            const student =
                database.students.find(
                    item =>
                        item.id.toLowerCase() ===
                        studentID.toLowerCase()
                );


            if (!student) {

                alert(
                    "Student SC Number not found."
                );

                return;

            }


            const bill = {

                id:
                    generateID("BILL"),

                studentID:
                    student.id,

                title:
                    form.get("title"),

                amount:
                    Number(
                        form.get("amount")
                    ),

                status:
                    form.get("status"),

                createdAt:
                    new Date().toISOString()

            };


            database.bills.push(
                bill
            );


            saveDatabase();


            closeModal();


            renderManagementDashboard();

        };

}


/* =========================================================
   TOGGLE BILL
   ========================================================= */

function toggleBill(
    billID
) {

    const bill =
        database.bills.find(
            item =>
                item.id ===
                billID
        );


    if (!bill) return;


    if (
        bill.status ===
        "Paid"
    ) {

        bill.status =
            "Pending";

    } else {

        bill.status =
            "Paid";

        bill.paidAt =
            new Date().toISOString();

    }


    saveDatabase();


    renderManagementDashboard();

}


/* =========================================================
   ADD SCHOOL ACCOUNT
   ========================================================= */

function addSchoolAccount() {

    openModal(`

        <h2>
            Add School Account
        </h2>


        <form
            id="schoolAccountForm"
        >

            <input
                name="name"
                placeholder="ACCOUNT NAME"
                required
            >


            <input
                name="number"
                placeholder="ACCOUNT NUMBER"
                required
            >


            <select
                name="bank"
                required
            >

                <option value="">
                    Select Bank / Wallet
                </option>

                ${getBankOptions()}

            </select>


            <select
                name="type"
            >

                <option>
                    Bank Account
                </option>

                <option>
                    Wallet
                </option>

            </select>


            <button
                class="btn primary full"
                type="submit"
            >
                Save Account
            </button>

        </form>

    `);


    $("#schoolAccountForm")
        .onsubmit =
        event => {

            event.preventDefault();


            const form =
                new FormData(
                    event.target
                );


            const account = {

                id:
                    generateID("ACC"),

                name:
                    form.get("name"),

                number:
                    form.get("number"),

                bank:
                    form.get("bank"),

                type:
                    form.get("type"),

                createdAt:
                    new Date().toISOString()

            };


            database.schoolAccounts.push(
                account
            );


            saveDatabase();


            closeModal();


            renderManagementDashboard();

        };

}


/* =========================================================
   REMOVE SCHOOL ACCOUNT
   ========================================================= */

function removeSchoolAccount(
    accountID
) {

    if (
        !confirm(
            "Remove this school account?"
        )
    ) {

        return;

    }


    database.schoolAccounts =
        database.schoolAccounts.filter(
            account =>
                account.id !==
                accountID
        );


    saveDatabase();


    renderManagementDashboard();

}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

function sendMessage() {

    openModal(`

        <h2>
            Send Message
        </h2>


        <form
            id="messageForm"
        >

            <input
                name="toID"
                placeholder="Student SC Number or Staff ID"
                required
            >


            <input
                name="subject"
                placeholder="Subject"
                required
            >


            <textarea
                name="message"
                rows="7"
                placeholder="Write your message..."
                required
            ></textarea>


            <button
                class="btn primary full"
                type="submit"
            >
                Send Message
            </button>

        </form>


        <p class="muted">

            This frontend version stores the message
            inside the portal. Real email delivery will
            require a secure backend/email service.

        </p>

    `);


    $("#messageForm")
        .onsubmit =
        event => {

            event.preventDefault();


            const form =
                new FormData(
                    event.target
                );


            sendMessageData(

                form.get("toID"),

                form.get("subject"),

                form.get("message")

            );

        };

}


/* =========================================================
   SEND MESSAGE TO SPECIFIC USER
   ========================================================= */

function sendMessageTo(
    userID
) {

    openModal(`

        <h2>
            Send Message
        </h2>


        <form
            id="messageForm"
        >

            <input
                name="toID"
                value="${escapeHTML(userID)}"
                readonly
                required
            >


            <input
                name="subject"
                placeholder="Subject"
                required
            >


            <textarea
                name="message"
                rows="7"
                placeholder="Write your message..."
                required
            ></textarea>


            <button
                class="btn primary full"
                type="submit"
            >
                Send Message
            </button>

        </form>

    `);


    $("#messageForm")
        .onsubmit =
        event => {

            event.preventDefault();


            const form =
                new FormData(
                    event.target
                );


            sendMessageData(

                form.get("toID"),

                form.get("subject"),

                form.get("message")

            );

        };

}


/* =========================================================
   MESSAGE DATA
   ========================================================= */

function sendMessageData(
    toID,
    subject,
    message
) {

    const cleanID =
        String(
            toID || ""
        ).trim();


    const studentExists =
        database.students.some(
            student =>
                student.id.toLowerCase() ===
                cleanID.toLowerCase()
        );


    const staffExists =
        database.staff.some(
            staff =>
                staff.id.toLowerCase() ===
                cleanID.toLowerCase()
        );


    if (
        !studentExists &&
        !staffExists
    ) {

        alert(
            "Student or Staff ID was not found."
        );

        return;

    }


    const newMessage = {

        id:
            generateID("MSG"),

        toID:
            studentExists
                ? database.students.find(
                    student =>
                        student.id.toLowerCase() ===
                        cleanID.toLowerCase()
                ).id
                : database.staff.find(
                    staff =>
                        staff.id.toLowerCase() ===
                        cleanID.toLowerCase()
                ).id,

        subject:
            String(
                subject || ""
            ).trim(),

        message:
            String(
                message || ""
            ).trim(),

        createdAt:
            new Date().toISOString(),

        read:
            false

    };


    database.messages.push(
        newMessage
    );


    saveDatabase();


    closeModal();


    alert(
        "Message sent successfully."
    );


    if (
        currentSession &&
        currentSession.role ===
        "management"
    ) {

        renderManagementDashboard();

    }

}


/* =========================================================
   ADD STUDENT DOCUMENT
   ========================================================= */

function addStudentDocument(
    selectedStudentID = ""
) {

    openModal(`

        <h2>
            Add Student Document
        </h2>


        <form
            id="studentDocumentForm"
        >

            <input
                name="studentID"
                value="${escapeHTML(selectedStudentID)}"
                placeholder="Student SC Number"
                required
            >


            <input
                name="documentName"
                placeholder="Document Name"
                required
            >


            <select
                name="documentType"
            >

                <option>
                    Birth Certificate
                </option>

                <option>
                    Previous Result
                </option>

                <option>
                    Admission Document
                </option>

                <option>
                    Passport
                </option>

                <option>
                    Other
                </option>

            </select>


            <input
                name="documentFile"
                type="file"
                accept="image/*,.pdf"
                required
            >


            <button
                class="btn primary full"
                type="submit"
            >
                Save Document
            </button>

        </form>

    `);


    $("#studentDocumentForm")
        .onsubmit =
        async event => {

            event.preventDefault();


            const form =
                new FormData(
                    event.target
                );


            const studentID =
                String(
                    form.get("studentID")
                ).trim();


            const student =
                database.students.find(
                    item =>
                        item.id.toLowerCase() ===
                        studentID.toLowerCase()
                );


            if (!student) {

                alert(
                    "Student SC Number not found."
                );

                return;

            }


            const file =
                form.get(
                    "documentFile"
                );


            if (!file) {

                alert(
                    "Please select a document."
                );

                return;

            }


            const fileData =
                await fileToDataURL(
                    file
                );


            if (!student.documents) {

                student.documents = [];

            }


            student.documents.push({

                id:
                    generateID("DOC"),

                name:
                    form.get("documentName"),

                type:
                    form.get("documentType"),

                fileName:
                    file.name,

                data:
                    fileData,

                createdAt:
                    new Date().toISOString()

            });


            saveDatabase();


            closeModal();


            alert(
                "Student document saved successfully."
            );


            renderManagementDashboard();

        };

}


/* =========================================================
   VIEW STUDENT DOCUMENTS
   ========================================================= */

function viewStudentDocuments(
    studentID
) {

    const student =
        database.students.find(
            item =>
                item.id ===
                studentID
        );


    if (!student) return;


    const documents =
        student.documents || [];


    openModal(`

        <h2>
            ${escapeHTML(student.fullName)}
        </h2>


        <p class="muted">
            SC Number:
            ${escapeHTML(student.id)}
        </p>


        ${
            documents.length

            ?

            documents.map(
                document =>
                    `

                    <div class="doc">

                        <div>

                            <b>
                                ${escapeHTML(document.name)}
                            </b>

                            <div class="muted">
                                ${escapeHTML(document.type)}
                            </div>

                        </div>


                        <div>

                            <button
                                class="btn secondary"
                                onclick="viewDocument('${student.id}','${document.id}')"
                            >
                                View
                            </button>


                            <button
                                class="btn danger"
                                onclick="removeStudentDocument('${student.id}','${document.id}')"
                            >
                                Remove
                            </button>

                        </div>

                    </div>

                `
            ).join("")

            :

            `
                <p class="muted">
                    No documents found.
                </p>
            `
        }

    `);

}


/* =========================================================
   REMOVE DOCUMENT
   ========================================================= */

function removeStudentDocument(
    studentID,
    documentID
) {

    const student =
        database.students.find(
            item =>
                item.id ===
                studentID
        );


    if (!student) return;


    if (
        !confirm(
            "Remove this document?"
        )
    ) {

        return;

    }


    student.documents =
        (student.documents || [])
            .filter(
                document =>
                    document.id !==
                    documentID
            );


    saveDatabase();


    viewStudentDocuments(
        studentID
    );

}


/* =========================================================
   PRINT SYSTEM
   ========================================================= */

function openPrintDocument(
    innerHTML,
    title
) {

    const school =
        database.settings.schoolName;


    const html = `

        <div class="print-page">

            <img
                src="logo.png"
                class="watermark"
                alt=""
            >


            <div class="print-content">

                <div class="print-header">

                    <img
                        src="logo.png"
                        alt="School Logo"
                    >

                    <h1>
                        ${escapeHTML(school)}
                    </h1>

                    <p>
                        ${escapeHTML(database.settings.address)}
                    </p>

                    <p>
                        Official School Document
                    </p>

                </div>


                ${innerHTML}

            </div>

        </div>

    `;


    openModal(
        html
    );


    document.title =
        title;


    setTimeout(
        () => {

            window.print();

        },
        400
    );

}


/* =========================================================
   PRINT STUDENT DETAILS
   ========================================================= */

function printStudentDetails(
    studentID
) {

    const student =
        database.students.find(
            item =>
                item.id ===
                studentID
        );


    if (!student) return;


    openPrintDocument(

        `

        <h2 style="text-align:center">
            STUDENT DETAILS
        </h2>


        <div
            style="
                text-align:center;
                margin:20px 0;
            "
        >

            <img
                src="${student.passport || "logo.png"}"
                style="
                    width:120px;
                    height:140px;
                    object-fit:cover;
                    border:1px solid #ccc;
                "
                alt="Student Passport"
            >

        </div>


        <p>
            <b>SC Number:</b>
            ${escapeHTML(student.id)}
        </p>


        <p>
            <b>Full Name:</b>
            ${escapeHTML(student.fullName)}
        </p>


        <p>
            <b>Class / Programme:</b>
            ${escapeHTML(student.className)}
        </p>


        <p>
            <b>Date of Birth:</b>
            ${escapeHTML(student.dob)}
        </p>


        <p>
            <b>Gender:</b>
            ${escapeHTML(student.gender)}
        </p>


        <p>
            <b>Phone:</b>
            ${escapeHTML(student.phone)}
        </p>


        <p>
            <b>Email:</b>
            ${escapeHTML(student.email)}
        </p>


        <p>
            <b>Address:</b>
            ${escapeHTML(student.address)}
        </p>


        <p>
            <b>Admission Status:</b>
            Approved
        </p>


        <p>
            <b>Academic Session:</b>
            ${escapeHTML(database.settings.session)}
        </p>


        `,

        "Student Details"

    );

}


/* =========================================================
   PRINT ADMISSION LETTER
   ========================================================= */

function printAdmissionLetter(
    studentID
) {

    const student =
        database.students.find(
            item =>
                item.id ===
                studentID
        );


    if (!student) return;


    openPrintDocument(

        `

        <h2
            style="
                text-align:center;
                margin-top:35px;
            "
        >
            ADMISSION LETTER
        </h2>


        <p>
            Date:
            ${new Date().toLocaleDateString()}
        </p>


        <p>
            Dear
            <b>
                ${escapeHTML(student.fullName)}
            </b>,
        </p>


        <p>
            We are pleased to inform you that
            you have been offered admission to
            <b>
                ${escapeHTML(database.settings.schoolName)}
            </b>
            for the
            <b>
                ${escapeHTML(database.settings.session)}
            </b>
            academic session.
        </p>


        <p>
            <b>SC Number:</b>
            ${escapeHTML(student.id)}
        </p>


        <p>
            <b>Class / Programme:</b>
            ${escapeHTML(student.className)}
        </p>


        <p>
            Please keep this admission letter
            safely and present it when requested
            by the School.
        </p>


        <br>


        <p>
            Yours faithfully,
        </p>


        <!--
           Replace signature.png with the final
           official school signature when provided.
        -->

        <img
            src="signature.png"
            class="signature"
            alt="Authorized Signature"
            onerror="this.style.display='none'"
        >


        <p>
            <b>
                School Management
            </b>
        </p>


        `,

        "Admission Letter"

    );

}


/* =========================================================
   PRINT RESULT
   ========================================================= */

function printResult(
    resultID
) {

    const result =
        database.results.find(
            item =>
                item.id ===
                resultID
        );


    if (!result) return;


    const student =
        database.students.find(
            item =>
                item.id ===
                result.studentID
        );


    if (!student) return;


    openPrintDocument(

        `

        <h2
            style="
                text-align:center;
                margin-top:35px;
            "
        >
            STUDENT RESULT
        </h2>


        <p>
            <b>Student Name:</b>
            ${escapeHTML(student.fullName)}
        </p>


        <p>
            <b>SC Number:</b>
            ${escapeHTML(student.id)}
        </p>


        <p>
            <b>Class:</b>
            ${escapeHTML(student.className)}
        </p>


        <p>
            <b>Academic Session:</b>
            ${escapeHTML(result.session)}
        </p>


        <p>
            <b>Term:</b>
            ${escapeHTML(result.term)}
        </p>


        <table
            class="table"
            style="min-width:0"
        >

            <tr>

                <th>
                    Subject
                </th>

                <th>
                    CA
                </th>

                <th>
                    Examination
                </th>

                <th>
                    Total
                </th>

                <th>
                    Grade
                </th>

            </tr>


            <tr>

                <td>
                    ${escapeHTML(result.subject)}
                </td>

                <td>
                    ${escapeHTML(result.ca)}
                </td>

                <td>
                    ${escapeHTML(result.exam)}
                </td>

                <td>
                    ${escapeHTML(result.score)}
                </td>

                <td>
                    ${escapeHTML(result.grade)}
                </td>

            </tr>

        </table>


        <br>


        <p>
            <b>
                Result status:
            </b>

            Officially Published
        </p>


        `,

        "Student Result"

    );

}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.managementTab =
    managementTab;

window.searchStudents =
    searchStudents;

window.approveApplication =
    approveApplication;

window.rejectApplication =
    rejectApplication;

window.renewActivationCode =
    renewActivationCode;

window.removeStudent =
    removeStudent;

window.restoreStudent =
    restoreStudent;

window.removeStaff =
    removeStaff;

window.restoreStaff =
    restoreStaff;

window.addStaff =
    addStaff;

window.editStaff =
    editStaff;

window.addResult =
    addResult;

window.removeResult =
    removeResult;

window.addBill =
    addBill;

window.toggleBill =
    toggleBill;

window.addSchoolAccount =
    addSchoolAccount;

window.removeSchoolAccount =
    removeSchoolAccount;

window.sendMessage =
    sendMessage;

window.sendMessageTo =
    sendMessageTo;

window.addStudentDocument =
    addStudentDocument;

window.viewStudentDocuments =
    viewStudentDocuments;

window.viewDocument =
    viewDocument;

window.removeStudentDocument =
    removeStudentDocument;

window.printStudentDetails =
    printStudentDetails;

window.printAdmissionLetter =
    printAdmissionLetter;

window.printResult =
    printResult;

window.editStudentProfile =
    editStudentProfile;


/* =========================================================
   START APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);

/* =========================================================
   BEST SCHOLARS INTERNATIONAL SCHOOL, ZARIA
   RESULT PRINTING + PAYMENT RECEIPT GENERATOR
   ========================================================= */

const SCHOOL_NAME = "BEST SCHOLARS INTERNATIONAL SCHOOL, ZARIA.";
const LOGO_PATH = "logo.png";

/* =========================================================
   SAFE STORAGE
   ========================================================= */

function getStudents() {
    return JSON.parse(localStorage.getItem("students") || "[]");
}

function saveStudents(data) {
    localStorage.setItem("students", JSON.stringify(data));
}

function getPayments() {
    return JSON.parse(localStorage.getItem("schoolPayments") || "[]");
}

function savePayments(data) {
    localStorage.setItem("schoolPayments", JSON.stringify(data));
}

function getResults() {
    return JSON.parse(localStorage.getItem("studentResults") || "[]");
}

function saveResults(data) {
    localStorage.setItem("studentResults", JSON.stringify(data));
}

/* =========================================================
   RESULT PRINTING
   ========================================================= */

function printStudentResult(studentId) {

    const results = getResults();

    const studentResults = results.filter(
        result =>
            String(result.studentId) === String(studentId) &&
            (
                result.published === true ||
                result.status === "published" ||
                result.status === "approved"
            )
    );

    if (!studentResults.length) {
        alert("No published result is available for this student.");
        return;
    }

    const students = getStudents();

    const student =
        students.find(
            s =>
                String(s.id) === String(studentId) ||
                String(s.studentId) === String(studentId) ||
                String(s.scNumber) === String(studentId) ||
                String(s.registrationNumber) === String(studentId)
        ) || {};

    const studentName =
        student.fullName ||
        student.name ||
        "Student";

    const scNumber =
        student.scNumber ||
        student.registrationNumber ||
        studentId;

    const rows = studentResults.map((r, index) => {

        const ca = Number(r.ca || r.CA || 0);
        const exam = Number(r.exam || r.Exam || 0);
        const total =
            Number(r.total || r.Total || (ca + exam));

        const average =
            Number(r.average || r.Average || total);

        const grade =
            r.grade ||
            r.Grade ||
            calculateGrade(average);

        return `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHTML(
                    r.subject ||
                    r.course ||
                    r.subjectName ||
                    "Subject"
                )}</td>
                <td>${ca}</td>
                <td>${exam}</td>
                <td>${total}</td>
                <td>${average.toFixed(1)}</td>
                <td>${escapeHTML(grade)}</td>
            </tr>
        `;
    }).join("");

    const totalScore = studentResults.reduce(
        (sum, r) =>
            sum +
            Number(
                r.total ||
                r.Total ||
                ((Number(r.ca || 0)) +
                (Number(r.exam || 0)))
            ),
        0
    );

    const average =
        totalScore / studentResults.length;

    const date =
        new Date().toLocaleDateString("en-NG");

    const printWindow = window.open(
        "",
        "_blank",
        "width=1000,height=800"
    );

    if (!printWindow) {
        alert("Please allow pop-ups to print the result.");
        return;
    }

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">

<title>Student Result - ${escapeHTML(studentName)}</title>

<style>

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 30px;
    font-family: Arial, Helvetica, sans-serif;
    color: #111;
    position: relative;
}

body::before {
    content: "";
    position: fixed;
    inset: 0;
    background-image: url("${LOGO_PATH}");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 350px;
    opacity: 0.06;
    z-index: -1;
}

.header {
    text-align: center;
    border-bottom: 3px solid #111;
    padding-bottom: 15px;
    margin-bottom: 20px;
}

.logo {
    width: 90px;
    height: 90px;
    object-fit: contain;
}

.school {
    font-size: 24px;
    font-weight: bold;
    margin-top: 8px;
}

.title {
    font-size: 20px;
    font-weight: bold;
    margin-top: 12px;
}

.student-info {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 20px;
    border: 1px solid #222;
    padding: 12px;
}

.info-item {
    font-size: 14px;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
}

th,
td {
    border: 1px solid #222;
    padding: 9px;
    text-align: center;
}

th {
    background: #eee;
    font-weight: bold;
}

.summary {
    margin-top: 20px;
    border: 1px solid #222;
    padding: 12px;
}

.signature-area {
    display: flex;
    justify-content: space-between;
    margin-top: 70px;
}

.signature {
    width: 220px;
    text-align: center;
    border-top: 1px solid #111;
    padding-top: 8px;
}

.print-button {
    position: fixed;
    right: 20px;
    top: 20px;
    padding: 10px 18px;
    border: none;
    background: #111;
    color: white;
    cursor: pointer;
    border-radius: 5px;
}

@media print {

    body {
        padding: 15px;
    }

    .print-button {
        display: none;
    }

}

</style>
</head>

<body>

<button class="print-button"
onclick="window.print()">
PRINT RESULT
</button>

<div class="header">

<img
src="${LOGO_PATH}"
class="logo"
onerror="this.style.display='none'"
>

<div class="school">
${SCHOOL_NAME}
</div>

<div class="title">
STUDENT ACADEMIC RESULT
</div>

</div>

<div class="student-info">

<div class="info-item">
<strong>Student Name:</strong>
${escapeHTML(studentName)}
</div>

<div class="info-item">
<strong>SC / Registration No:</strong>
${escapeHTML(scNumber)}
</div>

<div class="info-item">
<strong>Result Date:</strong>
${date}
</div>

<div class="info-item">
<strong>Subjects:</strong>
${studentResults.length}
</div>

</div>

<table>

<thead>
<tr>
<th>S/N</th>
<th>Subject</th>
<th>CA</th>
<th>Exam</th>
<th>Total</th>
<th>Average</th>
<th>Grade</th>
</tr>
</thead>

<tbody>

${rows}

</tbody>

</table>

<div class="summary">

<strong>Total Score:</strong>
${totalScore.toFixed(1)}
<br><br>

<strong>Overall Average:</strong>
${average.toFixed(1)}

</div>

<div class="signature-area">

<div class="signature">
Class Teacher
</div>

<div class="signature">
School Management
</div>

</div>

</body>
</html>
`);

    printWindow.document.close();

    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
    }, 700);
}


/* =========================================================
   GRADE CALCULATOR
   ========================================================= */

function calculateGrade(score) {

    score = Number(score);

    if (score >= 70) return "A";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    if (score >= 45) return "D";
    if (score >= 40) return "E";

    return "F";
}


/* =========================================================
   MANAGEMENT - PUBLISH RESULT
   ========================================================= */

function publishStudentResult(resultId) {

    const results = getResults();

    const result = results.find(
        r => String(r.id) === String(resultId)
    );

    if (!result) {
        alert("Result not found.");
        return;
    }

    result.published = true;
    result.status = "published";

    saveResults(results);

    alert("Result published successfully.");

    if (typeof renderApp === "function") {
        renderApp();
    }

    if (typeof loadDashboard === "function") {
        loadDashboard();
    }
}


/* =========================================================
   MANAGEMENT - UNPUBLISH RESULT
   ========================================================= */

function unpublishStudentResult(resultId) {

    const results = getResults();

    const result = results.find(
        r => String(r.id) === String(resultId)
    );

    if (!result) {
        alert("Result not found.");
        return;
    }

    result.published = false;
    result.status = "draft";

    saveResults(results);

    alert("Result has been removed from student view.");

    if (typeof renderApp === "function") {
        renderApp();
    }
}


/* =========================================================
   PAYMENT RECEIPT GENERATOR
   ========================================================= */

function generateSchoolReceipt(paymentId) {

    const payments = getPayments();

    const payment = payments.find(
        p => String(p.id) === String(paymentId)
    );

    if (!payment) {
        alert("Payment record not found.");
        return;
    }

    if (
        payment.status &&
        payment.status.toLowerCase() !== "approved" &&
        payment.status.toLowerCase() !== "paid"
    ) {
        alert(
            "This payment must be approved before a receipt can be generated."
        );
        return;
    }

    const students = getStudents();

    const student =
        students.find(
            s =>
                String(s.id) === String(payment.studentId) ||
                String(s.studentId) === String(payment.studentId) ||
                String(s.scNumber) === String(payment.studentId) ||
                String(s.registrationNumber) === String(payment.studentId)
        ) || {};

    const studentName =
        payment.studentName ||
        student.fullName ||
        student.name ||
        "Student";

    const scNumber =
        payment.scNumber ||
        student.scNumber ||
        student.registrationNumber ||
        payment.studentId ||
        "N/A";

    const amount =
        Number(
            payment.amount ||
            payment.paidAmount ||
            payment.total ||
            0
        );

    const purpose =
        payment.purpose ||
        payment.description ||
        payment.bill ||
        "School Payment";

    const paymentDate =
        payment.date ||
        payment.paymentDate ||
        new Date().toISOString();

    const receiptNumber =
        payment.receiptNumber ||
        createReceiptNumber();

    payment.receiptNumber = receiptNumber;
    payment.receiptGenerated = true;

    savePayments(payments);

    const formattedAmount =
        amount.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    const formattedDate =
        new Date(paymentDate)
        .toLocaleDateString("en-NG");

    const printWindow = window.open(
        "",
        "_blank",
        "width=900,height=800"
    );

    if (!printWindow) {
        alert("Please allow pop-ups to generate the receipt.");
        return;
    }

    printWindow.document.write(`
<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<title>
School Payment Receipt
</title>

<style>

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 30px;
    font-family: Arial, Helvetica, sans-serif;
    color: #111;
    position: relative;
}

body::before {
    content: "";
    position: fixed;
    inset: 0;

    background-image:
        url("${LOGO_PATH}");

    background-repeat: no-repeat;
    background-position: center;
    background-size: 350px;

    opacity: 0.05;

    z-index: -1;
}

.receipt {
    max-width: 750px;
    margin: auto;
    border: 2px solid #111;
    padding: 25px;
}

.header {
    text-align: center;
    border-bottom: 2px solid #111;
    padding-bottom: 15px;
}

.logo {
    width: 85px;
    height: 85px;
    object-fit: contain;
}

.school {
    font-size: 23px;
    font-weight: bold;
    margin-top: 8px;
}

.receipt-title {
    font-size: 21px;
    font-weight: bold;
    margin-top: 12px;
}

.receipt-number {
    text-align: right;
    margin-top: 15px;
    font-size: 14px;
}

.details {
    margin-top: 25px;
}

.row {
    display: flex;
    border-bottom: 1px solid #ccc;
    padding: 12px 5px;
}

.label {
    width: 40%;
    font-weight: bold;
}

.value {
    width: 60%;
}

.amount-box {
    margin-top: 25px;
    border: 2px solid #111;
    padding: 18px;
    text-align: center;
    font-size: 22px;
    font-weight: bold;
}

.footer {
    margin-top: 60px;
    display: flex;
    justify-content: space-between;
}

.signature {
    width: 220px;
    text-align: center;
    border-top: 1px solid #111;
    padding-top: 8px;
}

.print-button {
    position: fixed;
    right: 20px;
    top: 20px;
    padding: 10px 18px;
    border: none;
    background: #111;
    color: white;
    cursor: pointer;
    border-radius: 5px;
}

@media print {

    body {
        padding: 10px;
    }

    .print-button {
        display: none;
    }

}

</style>

</head>

<body>

<button
class="print-button"
onclick="window.print()"
>
PRINT RECEIPT
</button>

<div class="receipt">

<div class="header">

<img
src="${LOGO_PATH}"
class="logo"
onerror="this.style.display='none'"
>

<div class="school">
${SCHOOL_NAME}
</div>

<div class="receipt-title">
OFFICIAL PAYMENT RECEIPT
</div>

</div>

<div class="receipt-number">

<strong>Receipt No:</strong>
${escapeHTML(receiptNumber)}

</div>

<div class="details">

<div class="row">

<div class="label">
Student Name
</div>

<div class="value">
${escapeHTML(studentName)}
</div>

</div>

<div class="row">

<div class="label">
SC / Registration No
</div>

<div class="value">
${escapeHTML(scNumber)}
</div>

</div>

<div class="row">

<div class="label">
Payment Purpose
</div>

<div class="value">
${escapeHTML(purpose)}
</div>

</div>

<div class="row">

<div class="label">
Payment Date
</div>

<div class="value">
${formattedDate}
</div>

</div>

</div>

<div class="amount-box">

AMOUNT PAID

<br>

₦${formattedAmount}

</div>

<div class="footer">

<div class="signature">
Cashier / Accounts
</div>

<div class="signature">
School Management
</div>

</div>

</div>

</body>

</html>
`);

    printWindow.document.close();

    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
    }, 700);
}


/* =========================================================
   RECEIPT NUMBER
   ========================================================= */

function createReceiptNumber() {

    const now = new Date();

    const year = now.getFullYear();

    const random =
        Math.floor(
            100000 +
            Math.random() * 900000
        );

    return `BSIS-${year}-${random}`;
}


/* =========================================================
   ADD PAYMENT RECORD
   ========================================================= */

function addSchoolPayment(paymentData) {

    const payments = getPayments();

    const payment = {

        id:
            Date.now().toString(),

        studentId:
            paymentData.studentId || "",

        studentName:
            paymentData.studentName || "",

        scNumber:
            paymentData.scNumber || "",

        amount:
            Number(paymentData.amount || 0),

        purpose:
            paymentData.purpose || "School Payment",

        date:
            paymentData.date ||
            new Date().toISOString(),

        status:
            "pending",

        receiptGenerated:
            false

    };

    payments.push(payment);

    savePayments(payments);

    return payment;
}


/* =========================================================
   APPROVE PAYMENT
   ========================================================= */

function approveSchoolPayment(paymentId) {

    const payments = getPayments();

    const payment = payments.find(
        p => String(p.id) === String(paymentId)
    );

    if (!payment) {
        alert("Payment not found.");
        return;
    }

    payment.status = "approved";
    payment.approvedAt =
        new Date().toISOString();

    savePayments(payments);

    alert(
        "Payment approved successfully.\n\n" +
        "You can now generate the official receipt."
    );

    if (typeof renderApp === "function") {
        renderApp();
    }
}


/* =========================================================
   PAYMENT RECEIPT BUTTON
   ========================================================= */

function paymentReceiptButton(payment) {

    if (!payment) return "";

    if (
        payment.status !== "approved" &&
        payment.status !== "paid"
    ) {

        return `
            <button
                type="button"
                disabled
            >
                Receipt Pending Approval
            </button>
        `;
    }

    return `
        <button
            type="button"
            onclick="generateSchoolReceipt('${payment.id}')"
        >
            Generate Receipt
        </button>
    `;
}


/* =========================================================
   STUDENT RESULT BUTTON
   ========================================================= */

function studentResultPrintButton(studentId) {

    return `
        <button
            type="button"
            onclick="printStudentResult('${studentId}')"
        >
            🖨 Print Result
        </button>
    `;
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.printStudentResult =
    printStudentResult;

window.publishStudentResult =
    publishStudentResult;

window.unpublishStudentResult =
    unpublishStudentResult;

window.generateSchoolReceipt =
    generateSchoolReceipt;

window.createReceiptNumber =
    createReceiptNumber;

window.addSchoolPayment =
    addSchoolPayment;

window.approveSchoolPayment =
    approveSchoolPayment;

window.paymentReceiptButton =
    paymentReceiptButton;

window.studentResultPrintButton =
    studentResultPrintButton;

window.calculateGrade =
    calculateGrade;


/* =========================================================
   READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "BEST SCHOLARS INTERNATIONAL SCHOOL system loaded."
        );

        console.log(
            "Result printing and payment receipt generator ready."
        );

    }
);
