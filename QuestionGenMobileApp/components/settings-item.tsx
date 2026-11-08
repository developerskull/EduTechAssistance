import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';

interface SettingsItemProps {
  label: string;
  description?: string;
  isSwitch?: boolean;
  value?: boolean;
  onValueChange?: (val: boolean) => void;
  onPress?: () => void;
}

export default function SettingsItem({
  label,
  description,
  isSwitch = false,
  value = false,
  onValueChange,
  onPress,
}: SettingsItemProps) {
  const content = (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: Colors.gray300, true: Colors.primary }}
          thumbColor={Colors.white}
        />
      ) : (
        <Text style={styles.arrow}>›</Text>
      )}
    </View>
  );

  if (isSwitch) {
    return content;
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray800,
  },
  description: {
    fontSize: 11,
    color: Colors.gray500,
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: Colors.gray400,
  },
});

