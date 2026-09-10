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
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { ColorPicker } from '@/components/ColorPicker';
import { useAuth } from '@/contexts/AuthContext';
import { PRESET_COLORS } from '@/utils/colors';

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterScreen() {
  const COLORS = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegister() {
    console.log('[Register] Create account pressed for:', email);
    if (!validate()) return;
    setServerError('');
    setIsLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password, color });
      console.log('[Register] Registration successful, navigating to tabs');
      router.replace('/(tabs)/(home)');
    } catch (e: unknown) {
      console.error('[Register] Registration failed:', e);
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.';
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  function InputField({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    icon: Icon,
    secureTextEntry,
    showToggle,
    onToggle,
    keyboardType,
    returnKeyType,
    onSubmitEditing,
    inputRef,
    autoFocus,
  }: {
    label: string;
    value: string;
    onChangeText: (v: string) => void;
    placeholder: string;
    error?: string;
    icon: React.ComponentType<{ size: number; color: string }>;
    secureTextEntry?: boolean;
    showToggle?: boolean;
    onToggle?: () => void;
    keyboardType?: 'default' | 'email-address';
    returnKeyType?: 'next' | 'done';
    onSubmitEditing?: () => void;
    inputRef?: React.RefObject<TextInput | null>;
    autoFocus?: boolean;
  }) {
    const [focused, setFocused] = useState(false);
    return (
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
          {label}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: COLORS.surfaceSecondary,
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: error ? COLORS.danger : focused ? COLORS.primary : COLORS.border,
            paddingHorizontal: 14,
            gap: 10,
          }}
        >
          <Icon size={18} color={focused ? COLORS.primary : COLORS.textSecondary} />
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textTertiary}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType ?? 'default'}
            autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
            autoCorrect={false}
            returnKeyType={returnKeyType ?? 'next'}
            onSubmitEditing={onSubmitEditing}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus={autoFocus}
            style={{
              flex: 1,
              fontSize: 15,
              color: COLORS.text,
              paddingVertical: 14,
              fontFamily: 'SpaceGrotesk-Regular',
            }}
          />
          {showToggle && onToggle && (
            <TouchableOpacity onPress={onToggle} style={{ padding: 4 }}>
              {secureTextEntry ? (
                <Eye size={18} color={COLORS.textSecondary} />
              ) : (
                <EyeOff size={18} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>
          )}
        </View>
        {error ? (
          <Text
            style={{
              fontSize: 12,
              color: COLORS.danger,
              fontFamily: 'SpaceGrotesk-Regular',
            }}
          >
            {error}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 24,
          gap: 20,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <Link href="/(auth)/login" asChild>
          <AnimatedPressable
            onPress={() => console.log('[Register] Back to login')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: COLORS.surfaceSecondary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="Back to login"
            accessibilityRole="button"
          >
            <ArrowLeft size={20} color={COLORS.text} />
          </AnimatedPressable>
        </Link>

        {/* Title */}
        <View style={{ gap: 6 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: COLORS.text,
              fontFamily: 'SpaceGrotesk-Bold',
              letterSpacing: -0.5,
            }}
          >
            Join the family
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: COLORS.textSecondary,
              fontFamily: 'SpaceGrotesk-Regular',
            }}
          >
            Create your account to start booking the car
          </Text>
        </View>

        {/* Server error */}
        {serverError ? (
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
              {serverError}
            </Text>
          </View>
        ) : null}

        <InputField
          label="Full name"
          value={name}
          onChangeText={setName}
          placeholder="Alice Smith"
          error={errors.name}
          icon={User}
          autoFocus
          onSubmitEditing={() => emailRef.current?.focus()}
        />

        <InputField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          error={errors.email}
          icon={Mail}
          keyboardType="email-address"
          inputRef={emailRef}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        <InputField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Min. 8 characters"
          error={errors.password}
          icon={Lock}
          secureTextEntry={!showPassword}
          showToggle
          onToggle={() => {
            console.log('[Register] Toggle password visibility');
            setShowPassword((v) => !v);
          }}
          inputRef={passwordRef}
          onSubmitEditing={() => confirmRef.current?.focus()}
        />

        <InputField
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Repeat your password"
          error={errors.confirmPassword}
          icon={Lock}
          secureTextEntry={!showConfirm}
          showToggle
          onToggle={() => {
            console.log('[Register] Toggle confirm password visibility');
            setShowConfirm((v) => !v);
          }}
          inputRef={confirmRef}
          returnKeyType="done"
          onSubmitEditing={handleRegister}
        />

        {/* Color picker */}
        <ColorPicker
          selectedColor={color}
          onSelect={setColor}
          label="Your member color"
        />

        {/* Create account button */}
        <AnimatedPressable
          onPress={handleRegister}
          disabled={isLoading}
          style={{
            backgroundColor: COLORS.primary,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            marginTop: 4,
          }}
          accessibilityLabel="Create account"
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
            {isLoading ? 'Creating account…' : 'Create account'}
          </Text>
        </AnimatedPressable>

        {/* Login link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
          <Text
            style={{
              fontSize: 14,
              color: COLORS.textSecondary,
              fontFamily: 'SpaceGrotesk-Regular',
            }}
          >
            Already have an account?
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity onPress={() => console.log('[Register] Navigate to login')}>
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.primary,
                  fontWeight: '600',
                  fontFamily: 'SpaceGrotesk-SemiBold',
                }}
              >
                Sign in
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
