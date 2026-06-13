def get_risk_level(probability):
    if probability >= 0.80:
        return "Critical Risk"
    elif probability >= 0.60:
        return "High Risk"
    elif probability >= 0.35:
        return "Medium Risk"
    else:
        return "Low Risk"


def get_retention_recommendations(customer_data, top_reasons):
    recommendations = []

    def add(issue, action):
        recommendations.append({
            "issue": issue,
            "recommended_action": action
        })

    # Satisfaction Score
    if "Satisfaction Score" in top_reasons:
        score = customer_data.get("Satisfaction Score", 0)

        if score <= 2:
            add(
                "Low customer satisfaction",
                "Assign priority customer support and provide service recovery benefits."
            )
        elif score == 3:
            add(
                "Moderate customer satisfaction",
                "Send feedback survey and provide engagement offers."
            )

    # Monthly Charge
    if "Monthly Charge" in top_reasons:
        charge = customer_data.get("Monthly Charge", 0)

        if charge >= 90:
            add(
                "High monthly charges",
                "Offer 15-20% discount or suggest a lower-cost plan."
            )
        elif charge >= 60:
            add(
                "Moderately high billing",
                "Provide customized recharge or loyalty benefits."
            )

    # Contract
    if "Contract" in top_reasons:
        contract = customer_data.get("Contract", "")

        if contract == "Month-to-Month":
            add(
                "Short-term contract risk",
                "Offer yearly contract with discounted pricing and bonus benefits."
            )

    # Tenure
    if "Tenure in Months" in top_reasons:
        tenure = customer_data.get("Tenure in Months", 0)

        if tenure <= 6:
            add(
                "Low customer tenure",
                "Provide onboarding support and welcome rewards."
            )
        elif tenure <= 24:
            add(
                "Mid-term customer risk",
                "Offer loyalty rewards and personalized engagement plans."
            )

    # Online Security
    if "Online Security" in top_reasons:
        online_security = customer_data.get("Online Security", 0)

        if online_security == 0:
            add(
                "No online security service",
                "Provide free online security or bundled protection plan."
            )

    # Referrals
    if "Number of Referrals" in top_reasons:
        referrals = customer_data.get("Number of Referrals", 0)

        if referrals == 0:
            add(
                "Low referral engagement",
                "Offer referral bonus and loyalty rewards."
            )

    # Premium Tech Support
    if "Premium Tech Support" in top_reasons:
        support = customer_data.get("Premium Tech Support", 0)

        if support == 0:
            add(
                "No premium support access",
                "Provide free premium tech support trial."
            )

    # Extra Data Charges
    if "Total Extra Data Charges" in top_reasons:
        extra_charge = customer_data.get("Total Extra Data Charges", 0)

        if extra_charge > 0:
            add(
                "High extra data charges",
                "Recommend unlimited data plan or extra-data benefits."
            )

    # Default recommendation
    if len(recommendations) == 0:
        add(
            "General churn risk detected",
            "Provide personalized engagement and monitor customer activity."
        )

    return recommendations[:5]