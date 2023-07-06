import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, Alert, StyleSheet} from 'react-native';
import Purchases from 'react-native-purchases';
import PackageItem from '../components/Output/PackageItem';

/*
 An example paywall that uses the current offering.
 */
const PaywallScreen = () => {
  // - State for all available package
  const [packages, setPackages] = useState<any[]>([]);

  // - State for displaying an overlay view
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);

  // TODO Fetch all packages from RevenueCat
  useEffect(() => {
    const getPackages = async () => {
      try {
        const offerings = await Purchases?.getOfferings();

        if (offerings.current !== null) {
          // Display current offering with offerings.current
          console.log('offerings: ', offerings.current);
          setPackages(offerings.current.availablePackages);
        }
      } catch (e) {
        console.log('error: ', e);
      }
    };

    getPackages();
  }, []);

  const header = () => <Text style={styles.text}>Finner Premium</Text>;

  const footer = () => {
    console.warn(
      "Modify this value to reflect your app's Privacy Policy and Terms & Conditions agreements. Required to make it through App Review.",
    );
    return (
      <Text style={styles.text}>
        Don't forget to add your subscription terms and conditions. Read more
        about this here:
        https://www.revenuecat.com/blog/schedule-2-section-3-8-b
      </Text>
    );
  };

  // Render Item
  const renderItem = ({item}) => {
    console.log('item: ', item);
    return (
      <PackageItem purchasePackage={item} setIsPurchasing={setIsPurchasing} />
    );
  };

  return (
    <View style={styles.page}>
      {/* The paywall flat list displaying each package */}
      <FlatList
        data={packages}
        renderItem={renderItem}
        keyExtractor={item => item.identifier}
        ListHeaderComponent={header}
        ListHeaderComponentStyle={styles.headerFooterContainer}
        ListFooterComponent={footer}
        ListFooterComponentStyle={styles.headerFooterContainer}
      />

      {isPurchasing && <View style={styles.overlay} />}
    </View>
  );
};

export default PaywallScreen;

const styles = StyleSheet.create({
  page: {
    padding: 16,
  },
  text: {
    color: 'lightgrey',
  },
  headerFooterContainer: {
    marginVertical: 10,
  },
  overlay: {
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
    backgroundColor: 'black',
  },
});
