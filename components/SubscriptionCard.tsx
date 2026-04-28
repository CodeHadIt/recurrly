import { Image, View } from "react-native";

const SubscriptionCard = ({
  name,
  price,
  currency,
  icon,
  billing,
}: SubscriptionCardProps) => {
  return (
    <View className="sub-card bg-card">
      <View className="sub-head">
        <View className="sub-main">
          <Image source={icon} className="sub-icon" />
        </View>
      </View>
    </View>
  );
};

export default SubscriptionCard;
