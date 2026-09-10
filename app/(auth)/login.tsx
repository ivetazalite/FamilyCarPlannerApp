import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, Car } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const COLORS = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  async function handleLogin() {
    console.log('[Login] Sign in pressed for:', email);
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      console.log('[Login] Login successful, navigating to tabs');
      router.replace('/(tabs)/(home)');
    } catch (e: unknown) {
      console.error('[Login] Login failed:', e);
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Wrong email or password. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero header */}
        <View
          style={{
            backgroundColor: COLORS.primary,
            paddingHorizontal: 24,
            paddingTop: 48,
            paddingBottom: 40,
            gap: 16,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Car size={28} color="#FFFFFF" />
          </View>
          <View style={{ gap: 6 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '800',
                color: '#FFFFFF',
                fontFamily: 'SpaceGrotesk-Bold',
                letterSpacing: -0.5,
              }}
            >
              Family Car Planner
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: 'rgba(255,255,255,0.75)',
                fontFamily: 'SpaceGrotesk-Regular',
              }}
            >
              Sign in to manage your Kia e-Niro
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={{ padding: 24, gap: 20 }}>
          {/* Error */}
          {error ? (
            <View
              style={{
                backgroundColor: COLORS.dangerMuted,
                borderRadius: 10,
                padding: 12,
                borderWidth: 1,
                borderColor: COLORS.danger + '40',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.danger,
                  fontFamily: 'SpaceGrotesk-Regular',
                }}
              >
                {error}
              </Text>
            </View>
          ) : null}

          {/* Email */}
          <View style={{ gap: 6 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: COLORS.textSecondary,
                fontFamily: 'SpaceGrotesk-SemiBold',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Email
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surfaceSecondary,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: emailFocused ? COLORS.primary : COLORS.border,
                paddingHorizontal: 14,
                gap: 10,
              }}
            >
              <Mail size={18} color={emailFocused ? COLORS.primary : COLORS.textSecondary} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                style={{
                  flex: 1,
                  fontSize: 15,
                  color: COLORS.text,
                  paddingVertical: 14,
                  fontFamily: 'SpaceGrotesk-Regular',
                }}
              />
            </View>
          </View>

          {/* Password */}
          <View style={{ gap: 6 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: COLORS.textSecondary,
                fontFamily: 'SpaceGrotesk-SemiBold',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Password
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COLORS.surfaceSecondary,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: passwordFocused ? COLORS.primary : COLORS.border,
                paddingHorizontal: 14,
                gap: 10,
              }}
            >
              <Lock size={18} color={passwordFocused ? COLORS.primary : COLORS.textSecondary} />
              <TextInput
                ref={passwordRef}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textTertiary}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                style={{
                  flex: 1,
                  fontSize: 15,
                  color: COLORS.text,
                  paddingVertical: 14,
                  fontFamily: 'SpaceGrotesk-Regular',
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  console.log('[Login] Toggle password visibility');
                  setShowPassword((v) => !v);
                }}
                style={{ padding: 4 }}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={18} color={COLORS.textSecondary} />
                ) : (
                  <Eye size={18} color={COLORS.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign in button */}
          <AnimatedPressable
            onPress={handleLogin}
            disabled={isLoading}
            style={{
              backgroundColor: COLORS.primary,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 4,
            }}
            accessibilityLabel="Sign in"
            accessibilityRole="button"
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#FFFFFF',
                fontFamily: 'SpaceGrotesk-Bold',
              }}
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Text>
          </AnimatedPressable>

          {/* Register link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 8 }}>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.textSecondary,
                fontFamily: 'SpaceGrotesk-Regular',
              }}
            >
              New to the family?
            </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity
                onPress={() => console.log('[Login] Navigate to register')}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: COLORS.primary,
                    fontWeight: '600',
                    fontFamily: 'SpaceGrotesk-SemiBold',
                  }}
                >
                  Create account
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
