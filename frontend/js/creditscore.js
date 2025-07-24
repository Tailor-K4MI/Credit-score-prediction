document.getElementById("creditScoreForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    let formData = {
        enq_L3m: parseFloat(document.getElementById("enq_L3m").value),
        num_std: parseFloat(document.getElementById("num_std").value),
        time_since_recent_enq: parseFloat(document.getElementById("time_since_recent_enq").value),
        num_std_12mts: parseFloat(document.getElementById("num_std_12mts").value),
        enq_L6m: parseFloat(document.getElementById("enq_L6m").value),
        AGE: parseInt(document.getElementById("AGE").value),
        recent_level_of_deliq: parseFloat(document.getElementById("recent_level_of_deliq").value),
        time_since_recent_deliquency: parseFloat(document.getElementById("time_since_recent_deliquency").value),
        Time_With_Curr_Empr: parseFloat(document.getElementById("Time_With_Curr_Empr").value),
        time_since_recent_payment: parseFloat(document.getElementById("time_since_recent_payment").value),
        NETMONTHLYINCOME: parseFloat(document.getElementById("NETMONTHLYINCOME").value)
    };
    let inputdata = {
        pct_of_active_TLs_ever: parseFloat(document.getElementById('pct_of_active_TLs_ever').value),
        pct_PL_enq_L6m_of_ever: parseFloat(document.getElementById('pct_PL_enq_L6m_of_ever').value),
        num_std_6mts: parseFloat(document.getElementById('num_std_6mts').value),
        pct_currentBal_all_TL: parseFloat(document.getElementById('pct_currentBal_all_TL').value),
        max_unsec_exposure_inPct: parseFloat(document.getElementById('max_unsec_exposure_inPct').value),
        tot_enq: parseFloat(document.getElementById('tot_enq').value),
        PL_utilization: parseFloat(document.getElementById('PL_utilization').value),
        EDUCATION: parseFloat(document.getElementById('EDUCATION').value)
    }

    console.log("Sending JSON:", JSON.stringify(formData)); // Debugging

    try {
        let response = await fetch("http://127.0.0.1:8000/predict", {  // ✅ Correct URL
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error("HTTP error! Status: " + response.status);
        }

        let result = await response.json();
        document.getElementById("result").innerText = "Predicted Credit Score: " + result.predicted_credit_score;
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to fetch data. Make sure the API is running!");       
    }
    let creditScore = parseInt(result.predicted_credit_score);
    drawCreditScoreGauge(creditScore);
    evaluateCreditCriteria(creditScore);

});
function drawCreditScoreGauge(creditScore) {
    let ctx = document.getElementById("creditScoreChart").getContext("2d");

    let scoreRange = [300, 580, 670, 740, 800, 850];
    let colors = ["#E74C3C", "#F39C12", "#F7DC6F", "#A3E048", "#2ECC71"];
    let labels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

    let color = "#2ECC71"; // Default green
    for (let i = 0; i < scoreRange.length - 1; i++) {
        if (creditScore >= scoreRange[i] && creditScore < scoreRange[i + 1]) {
            color = colors[i];
            break;
        }
    }

    let data = [20, 20, 20, 20, 20]; // Last value hides bottom half
    let backgroundColors = [...colors, "transparent"];

    // ✅ Destroy previous chart instance if exists
    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [
                {
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 0
                }
            ]
        },
        options: {
            rotation: -90,
            circumference: 180,
            cutout: "60%",
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        },
        animation: {
            onComplete: function () {
                drawNeedle(creditScore);
            }
        }
    });

    console.log("Credit Score Gauge Updated ✅");

   
}

function drawNeedle(creditScore) {
    let canvas = document.getElementById("creditScoreChart");
    let ctx = canvas.getContext("2d");

    let centerX = canvas.width / 2;
    let centerY = canvas.height - 10; // Adjust for half gauge
    let needleLength = canvas.height / 3;
    let angle = ((creditScore - 300) / 550) * Math.PI; // Map score to angle (0 to π)

    // ✅ Clear previous needle
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ✅ Draw Needle
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
        centerX + needleLength * Math.cos(angle - Math.PI),
        centerY + needleLength * Math.sin(angle - Math.PI)
    );
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.stroke();

    // ✅ Draw Needle Base
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();

    console.log("Needle Updated ✅", angle);
}



//criteria
function evaluateCreditCriteria(creditScore) {
    let creditUtilization = parseFloat(document.getElementById("PL_utilization").value);
    let latePayments = parseInt(document.getElementById("recent_level_of_deliq").value);
    let totalLoans = parseInt(document.getElementById("num_std").value);
    let debtAmount = parseFloat(document.getElementById("max_unsec_exposure_inPct").value);
    let newCreditInquiries = parseInt(document.getElementById("enq_L6m").value);
    let monthlyIncome = parseFloat(document.getElementById("NETMONTHLYINCOME").value);
    let loanUsage = parseFloat(document.getElementById("pct_PL_enq_L6m_of_ever").value);
    let oldAccounts = parseFloat(document.getElementById("Time_With_Curr_Empr").value);
    let education = document.getElementById("EDUCATION").value;

    const criteria = [
        { text: "Pay Bills on Time", fulfilled: latePayments === 0, tip: "Set up automatic payments to avoid missing due dates." },
        { text: "Keep Credit Utilization Below 30%", fulfilled: creditUtilization < 30, tip: "Try to reduce credit usage below 30% of your available credit limit." },
        { text: "Avoid Too Many New Credit Inquiries", fulfilled: newCreditInquiries < 3, tip: "Limit new credit applications to avoid hard inquiries on your report." },
        { text: "Maintain Low Debt", fulfilled: debtAmount < 5000, tip: "Reduce your outstanding debt to improve your creditScore." },
        { text: "Keep a Good Credit Score", fulfilled: creditScore >= 700, tip: "Keep up responsible credit use to maintain a high creditScore." },
        { text: "Maintain Old Accounts", fulfilled: oldAccounts >= 3, tip: "Keep your oldest accounts open to improve credit history." },
        { text: "Diversify Credit Types", fulfilled: totalLoans >= 2, tip: "Having different credit types (credit cards, loans) can strengthen your creditScore." },
        { text: "Increase Monthly Income-to-Debt Ratio", fulfilled: monthlyIncome > 3000, tip: "A higher income can improve your credit-to-debt ratio." },
        { text: "Monitor Credit Reports Regularly", fulfilled: true, tip: "Check your credit report every 3 months to spot errors and fraud." },
        { text: "Settle Outstanding Debts", fulfilled: debtAmount === 0, tip: "Pay off any outstanding collections or charge-offs." },
        { text: "Limit Credit Inquiries", fulfilled: newCreditInquiries < 2, tip: "Avoid applying for multiple credit lines in a short time." },
        { text: "Keep Balances Low on Credit Cards", fulfilled: creditUtilization < 20, tip: "Keep balances well below your limit to improve utilization ratio." },
        { text: "Avoid High-Interest Loans", fulfilled: loanUsage < 25, tip: "If possible, refinance high-interest loans at better rates." },
        { text: "Increase Your Credit Limits", fulfilled: debtAmount < 2000, tip: "Request an increase in your credit limits to improve utilization." },
        { text: "Good Education Impact", fulfilled: ["Graduate", "Post Graduate", "Professional"].includes(education), tip: "Higher education levels may positively impact financial stability." }
    ];

    let fulfilledList = document.getElementById("fulfilled-list");
    let unfulfilledList = document.getElementById("unfulfilled-list");
    let improvementTips = document.getElementById("improvement-tips");

    fulfilledList.innerHTML = "<h3>Fulfilled Criteria</h3>";
    unfulfilledList.innerHTML = "<h3>Unfulfilled Criteria</h3>";
    improvementTips.innerHTML = "<h3>Tips to Improve</h3>";

    let fulfilledCount = 0;

    criteria.forEach(c => {
        let li = document.createElement("li");
        li.textContent = c.text;
        if (c.fulfilled) {
            fulfilledList.appendChild(li);
            fulfilledCount++;
        } else {
            unfulfilledList.appendChild(li);
            let tip = document.createElement("li");
            tip.textContent = `➡️ ${c.tip}`;
            improvementTips.appendChild(tip);
        }
    });

    if (fulfilledCount >= 15) {
        improvementTips.innerHTML += "<p>🎉 You meet most of the key credit creditScore criteria! Keep up the great financial habits.</p>";
    } else {
        improvementTips.innerHTML += "<p>⚠️ You have areas for improvement. Follow the tips above to boost your credit creditScore.</p>";
    }

    console.log(`Criteria Checked ✅ - ${fulfilledCount} Criteria Fulfilled`);
}
document.getElementById("downloadReportBtn").addEventListener("click", function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    let y = 20;
    const lineHeight = 7;
    const pageHeight = 290;
    const margin = 20;
    const wrapWidth = 170;

    const score = document.getElementById("result").innerText || "Credit score not calculated.";

    // ✅ Use a standard font to avoid weird symbols
    doc.setFont("times", "normal");
    doc.setFontSize(18);
    doc.text("Credit Score Evaluation Report", margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(score, margin, y);
    y += 10;

    // ✅ Fulfilled Criteria
    doc.setFontSize(14);
    doc.text("Fulfilled Criteria", margin, y);
    y += 8;
    const fulfilledItems = document.querySelectorAll("#fulfilled-list li");
    fulfilledItems.forEach(item => {
        const lines = doc.splitTextToSize("- " + item.textContent, wrapWidth);
        lines.forEach(line => {
            if (y >= pageHeight) { doc.addPage(); y = margin; }
            doc.text(line, margin + 5, y);
            y += lineHeight;
        });
    });

    // ✅ Unfulfilled Criteria
    y += 5;
    doc.setFontSize(14);
    doc.text("Unfulfilled Criteria", margin, y);
    y += 8;
    const unfulfilledItems = document.querySelectorAll("#unfulfilled-list li");
    unfulfilledItems.forEach(item => {
        const lines = doc.splitTextToSize("- " + item.textContent, wrapWidth);
        lines.forEach(line => {
            if (y >= pageHeight) { doc.addPage(); y = margin; }
            doc.text(line, margin + 5, y);
            y += lineHeight;
        });
    });

    // ✅ Tips Section (Fix: Remove emoji, wrap correctly)
    y += 5;
    doc.setFontSize(14);
    doc.text("Improvement Tips", margin, y);
    y += 8;
    const tipItems = document.querySelectorAll("#improvement-tips li");
    tipItems.forEach(item => {
        const cleanText = item.textContent.replace(/[^a-zA-Z0-9.,%()'"\-\s]/g, ""); // removes emojis/strange chars
        const lines = doc.splitTextToSize("- " + cleanText.trim(), wrapWidth);
        lines.forEach(line => {
            if (y >= pageHeight) { doc.addPage(); y = margin; }
            doc.text(line, margin + 5, y);
            y += lineHeight;
        });
    });

    doc.save("credit_score_report.pdf");
});


