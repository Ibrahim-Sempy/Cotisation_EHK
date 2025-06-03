import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatAmount } from '../utils/formatters';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  bgColor?: string;
  isAmount?: boolean;
}

export default function StatCard({
  title,
  value,
  icon,
  color = '#1E293B',
  bgColor = '#F8FAFC',
  isAmount = false,
}: StatCardProps) {
  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.value, { color }]}>
            {isAmount && typeof value === 'number' ? formatAmount(value) : value}
          </Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
  },
  content: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});