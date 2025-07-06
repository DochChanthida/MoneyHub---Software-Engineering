document.addEventListener("DOMContentLoaded", () => {
  const editProfileBtn = document.querySelector(".edit-profile");
  const userProfileName = document.querySelector(".user-sidebar h3");
  const userProfilePic = document.querySelector(".user-profile-pic img");
  const userMainContent = document.querySelector(".user-main-content");

  if (!editProfileBtn || !userProfileName || !userProfilePic || !userMainContent) return;

  let userData = {
    "First Name": document.querySelector('.user-info-item:nth-child(1) p')?.textContent || "",
    "Last Name": document.querySelector('.user-info-item:nth-child(2) p')?.textContent || "",
    "Gender": document.querySelector('.user-info-item:nth-child(3) p')?.textContent || "",
    "Date of Birth": document.querySelector('.user-info-item:nth-child(4) p')?.textContent || "",
    "Email Address": document.querySelector('.user-info-item:nth-child(5) p')?.textContent || "",
    "Contact Number": document.querySelector('.user-info-item:nth-child(6) p')?.textContent || "",
    "Address": document.querySelector('.user-info-item:nth-child(7) p')?.textContent || "",
    "profileName": userProfileName.textContent,
    "profilePic": userProfilePic.src
  };

  let isEditMode = false;

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());
  }

  function validatePhoneNumber(phone) {
    return /^\(?\+\d{1,4}\)?[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{3}$/.test(phone);
  }

  function parseDate(dateStr) {
    if (!dateStr) return new Date();
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    if (/^\d{2}-\d{2}-\d{2}$/.test(dateStr)) {
      const [d, m, y] = dateStr.split("-").map(Number);
      const year = y < 50 ? 2000 + y : 1900 + y;
      return new Date(year, m - 1, d);
    }
    return new Date(dateStr);
  }

  function generateEditModeTemplate() {
    return `
      <h2>Personal Information</h2>
      <div class="user-info-grid">
        ${Object.entries(userData).map(([key, value]) => {
          if (key === "profileName" || key === "profilePic") return "";
          const isDate = key === "Date of Birth";
          const isGender = key === "Gender";
          return `
            <div class="user-info-item">
              <label>${key}:</label>
              <div class="field-container">
                <div class="field-value">${value}</div>
                ${isDate ? '<span class="calendar-icon">📅</span>' : '<span class="edit-icon">Edit</span>'}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  editProfileBtn.addEventListener("click", () => {
    if (isEditMode) return;
    isEditMode = true;
    editProfileBtn.style.display = "none";

    const saveBtn = document.createElement("button");
    saveBtn.className = "user-btn save-btn";
    saveBtn.textContent = "Save Changes";

    const discardBtn = document.createElement("button");
    discardBtn.className = "user-btn discard-btn";
    discardBtn.textContent = "Discard Changes";

    saveBtn.addEventListener("click", saveChanges);
    discardBtn.addEventListener("click", discardChanges);

    editProfileBtn.parentNode.appendChild(saveBtn);
    editProfileBtn.parentNode.appendChild(discardBtn);

    userMainContent.innerHTML = generateEditModeTemplate();

    setupEditIcons();
    setupDateField();
    setupProfilePicEdit();
  });

  function setupEditIcons() {
    document.querySelectorAll(".edit-icon").forEach((icon) => {
      icon.addEventListener("click", function handleEdit() {
        const container = this.closest(".field-container");
        const valueDiv = container.querySelector(".field-value");
        const label = container.closest(".user-info-item").querySelector("label").textContent.replace(":", "");

        if (label === "Gender") {
          const select = document.createElement("select");
          ["Male", "Female",].forEach(opt => {
            const o = document.createElement("option");
            o.value = o.textContent = opt;
            if (opt === valueDiv.textContent) o.selected = true;
            select.appendChild(o);
          });
          valueDiv.innerHTML = "";
          valueDiv.appendChild(select);
        } else {
          const input = document.createElement("input");
          input.type = "text";
          input.value = valueDiv.textContent.trim();
          input.className = "field-value-edit";
          valueDiv.innerHTML = "";
          valueDiv.appendChild(input);
        }

        this.textContent = "Accept";
        this.removeEventListener("click", handleEdit);
        this.addEventListener("click", function acceptEdit() {
          const inputVal = container.querySelector("input, select").value.trim();
          valueDiv.innerHTML = inputVal;
          this.textContent = "Edit";
          this.removeEventListener("click", acceptEdit);
          this.addEventListener("click", handleEdit);
        });
      });
    });
  }

  function setupDateField() {
    const dateField = [...document.querySelectorAll(".user-info-item")].find(item =>
      item.querySelector("label")?.textContent.includes("Date of Birth")
    );
    if (!dateField) return;

    const calendarIcon = dateField.querySelector(".calendar-icon");
    const valueDiv = dateField.querySelector(".field-value");

    calendarIcon.addEventListener("click", function openPicker() {
      const dateInput = document.createElement("input");
      dateInput.type = "text";
      dateInput.className = "field-value-edit datepicker";
      dateInput.value = valueDiv.textContent;
      valueDiv.innerHTML = "";
      valueDiv.appendChild(dateInput);

      const acceptBtn = document.createElement("span");
      acceptBtn.className = "accept-date";
      acceptBtn.textContent = "Accept";
      dateField.querySelector(".field-container").appendChild(acceptBtn);

      acceptBtn.addEventListener("click", () => {
        valueDiv.innerHTML = dateInput.value;
        acceptBtn.remove();
        calendarIcon.addEventListener("click", openPicker);
      });

      calendarIcon.removeEventListener("click", openPicker);

      if (window.flatpickr) {
        window.flatpickr(dateInput, {
          dateFormat: "d-m-Y",
          defaultDate: parseDate(dateInput.value),
          onClose: () => acceptBtn.click(),
        });
      } else {
        dateInput.type = "date";
        const parsed = parseDate(dateInput.value);
        dateInput.value = parsed.toISOString().split("T")[0];
        dateInput.addEventListener("change", () => {
          const [y, m, d] = dateInput.value.split("-");
          dateInput.value = `${d}-${m}-${y}`;
          acceptBtn.click();
        });
      }

      dateInput.focus();
    });
  }
  function setupProfilePicEdit() {
    let existingWrapper = document.querySelector(".profile-pic-edit-wrapper");
    if (existingWrapper) existingWrapper.remove();
  
    const wrapper = document.createElement("div");
    wrapper.className = "profile-pic-edit-wrapper";
  
    const profilePicEdit = document.createElement("span");
    profilePicEdit.className = "profile-pic-edit";
    profilePicEdit.textContent = "Change Photo";
  
    wrapper.appendChild(profilePicEdit);
  
    const sidebar = document.querySelector(".user-sidebar");
    const nameEl = sidebar.querySelector("h3");
    if (nameEl) {
      sidebar.insertBefore(wrapper, nameEl); // insert above user name
    }
  
    profilePicEdit.addEventListener("click", () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.style.display = "none";
      document.body.appendChild(fileInput);
      fileInput.click();
  
      fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            document.querySelectorAll(".user-profile-pic img").forEach(img => {
              img.src = e.target.result;
            });
          };
          reader.readAsDataURL(file);
        }
        fileInput.remove();
      });
    });
  }
  
  function saveChanges() {
    const updated = {};
    let hasErrors = false;
    const messages = [];

    document.querySelectorAll(".user-info-item").forEach(item => {
      const label = item.querySelector("label").textContent.replace(":", "").trim();
      const valEl = item.querySelector(".field-value");
      const value = valEl?.textContent?.trim() || "";

      if (!value) {
        hasErrors = true;
        messages.push(`${label} cannot be empty.`);
      }

      if (label === "Email Address" && !validateEmail(value)) {
        hasErrors = true;
        messages.push("Invalid email address.");
      }

      if (label === "Contact Number" && !validatePhoneNumber(value)) {
        hasErrors = true;
        messages.push("Invalid phone number format.");
      }

      updated[label] = value;
    });

    if (hasErrors) {
      alert(messages.join("\n"));
      return;
    }

    Object.assign(userData, updated);
    userData.profileName = `Mr. ${userData["First Name"]} ${userData["Last Name"]}`;
    userData.profilePic = document.querySelector(".user-profile-pic img").src;

    applyChangesToView();
    resetToViewMode();
  }

  function applyChangesToView() {
    userProfileName.textContent = userData.profileName;
    userProfilePic.src = userData.profilePic;
    [...document.querySelectorAll(".user-info-item")].forEach(item => {
      const label = item.querySelector("label").textContent.replace(":", "").trim();
      const p = item.querySelector("p");
      if (p && userData[label]) {
        p.textContent = userData[label];
      }
    });
  }

  function discardChanges() {
    resetToViewMode();
  }

  function resetToViewMode() {
    isEditMode = false;
    document.querySelector(".save-btn")?.remove();
    document.querySelector(".discard-btn")?.remove();
    document.querySelector(".profile-pic-edit")?.remove();
    editProfileBtn.style.display = "block";

    userMainContent.innerHTML = `
      <h2>Personal Information</h2>
      <div class="user-info-grid">
        ${Object.entries(userData).map(([key, value]) => {
          if (key === "profileName" || key === "profilePic") return "";
          return `
            <div class="user-info-item">
              <label>${key}:</label>
              <p class="user-bold">${value}</p>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }
});

