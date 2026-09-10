import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { ColorPicker } from '@/components/ColorPicker';
import { useAuth } from '@/contexts/AuthContext';
import { PRESET_COLORS } from '@/utils/colors';

// ─── helpers ────────────────────────────────────────────────────────────────

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type PasswordStrength = 0 | 1 | 2 | 3 | 4;

function getPasswordStrength(pw: string): PasswordStrength {
  if (pw.length === 0) return 0;
  if (pw.length < 8) return 1;
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  if (hasUpper && hasNumber && hasSpecial) return 4;
  if (hasUpper || hasNumber) return 3;
  return 2;
}

const STRENGTH_LABELS: Record<PasswordStrength, string> = {
  0: '',
  1: 'Too short',
  2: 'Weak',
  3: 'Good',
  4: 'Strong',
};

const COLOR_NAMES: Record<string, string> = {
  '#3B82F6': 'Ocean Blue',
  '#10B981': 'Emerald',
  '#F59E0B': 'Amber',
  '#EF4444': 'Coral',
  '#A855F7': 'Violet',
  '#EC4899': 'Rose',
};

// ─── sub-components ─────────────────────────────────────────────────────────

interface StrengthBarProps {
  strength: PasswordStrength;
}

function StrengthBar({ strength }: StrengthBarProps) {
  const COLORS = useColors();

  const segmentColors: Record<PasswordStrength, string> = {
    0: COLORS.border,
    1: COLORS.danger,
    2: COLORS.warning,
    3: '#EAB308',
    4: COLORS.success,
  };

  const activeColor = segmentColors[strength];
  const label = STRENGTH_LABELS[strength];

  return (
    <View style={{ gap: 6, marginTop: 6 }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {([1, 2, 3, 4] as PasswordStrength[]).map((seg) => (
          <View
            key={seg}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              backgroundColor: strength >= seg ? activeColor : COLORS.border,
            }}
          />
        ))}
      </View>
      {label ? (
        <Text
          style={{
            fontSize: 11,
            color: strength > 0 ? activeColor : COLORS.textTertiary,
            fontFamily: 'SpaceGrotesk-Regular',
          }}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
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
  disabled?: boolean;
  rightElement?: React.ReactNode;
  children?: React.ReactNode;
}

function InputField({
  label,
  value,
  onChangeText,
  onBlur,
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
  disabled,
  rightElement,
  children,
}: InputFieldProps) {
  const COLORS = useColors();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? COLORS.danger : focused ? COLORS.primary : COLORS.border;
  const iconColor = focused ? COLORS.primary : COLORS.textSecondary;

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
          borderColor,
          paddingHorizontal: 14,
          gap: 10,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Icon size={18} color={iconColor} />
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
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          autoFocus={autoFocus}
          editable={!disabled}
          style={{
            flex: 1,
            fontSize: 15,
            color: COLORS.text,
            paddingVertical: 14,
            fontFamily: 'SpaceGrotesk-Regular',
          }}
        />
        {rightElement}
        {showToggle && onToggle && (
          <AnimatedPressable
            onPress={onToggle}
            style={{ padding: 4 }}
            accessibilityLabel={secureTextEntry ? 'Show password' : 'Hide password'}
          >
            {secureTextEntry ? (
              <Eye size={18} color={COLORS.textSecondary} />
            ) : (
              <EyeOff size={18} color={COLORS.textSecondary} />
            )}
          </AnimatedPressable>
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
      {children}
    </View>
  );
}

// ─── main screen ────────────────────────────────────────────────────────────

const FIELD_COUNT = 6; // back btn, title, name, email, password, confirm, color, button = stagger 8 items

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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  // Entrance animations — one Animated.Value per staggered item
  const anims = useRef(
    Array.from({ length: 8 }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(12),
    }))
  ).current;

  // Button pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Button success color
  const buttonBgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 280,
          delay: i * 60,
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 280,
          delay: i * 60,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.stagger(60, animations).start();
  }, []);

  useEffect(() => {
    if (isLoading) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.65, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }, [isLoading]);

  // ── per-field validation ──────────────────────────────────────────────────

  const validateField = useCallback(
    (field: string, values?: { name: string; email: string; password: string; confirmPassword: string }) => {
      const v = values ?? { name, email, password, confirmPassword };
      const newErrors = { ...errors };

      if (field === 'name') {
        if (!v.name.trim()) newErrors.name = 'Name is required';
        else delete newErrors.name;
      }
      if (field === 'email') {
        if (!v.email.trim()) newErrors.email = 'Email is required';
        else if (!validateEmail(v.email)) newErrors.email = 'Enter a valid email address';
        else delete newErrors.email;
      }
      if (field === 'password') {
        if (!v.password) newErrors.password = 'Password is required';
        else if (v.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        else delete newErrors.password;
      }
      if (field === 'confirmPassword') {
        if (!v.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (v.password !== v.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        else delete newErrors.confirmPassword;
      }

      setErrors(newErrors);
    },
    [errors, name, email, password, confirmPassword]
  );

  function handleBlur(field: string) {
    console.log(`[Register] Field blurred: ${field}`);
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  }

  function handleNameChange(v: string) {
    setName(v);
    if (touched.name) validateField('name', { name: v, email, password, confirmPassword });
  }
  function handleEmailChange(v: string) {
    setEmail(v);
    if (touched.email) validateField('email', { name, email: v, password, confirmPassword });
  }
  function handlePasswordChange(v: string) {
    setPassword(v);
    if (touched.password) validateField('password', { name, email, password: v, confirmPassword });
    // also re-validate confirm if it was touched
    if (touched.confirmPassword) validateField('confirmPassword', { name, email, password: v, confirmPassword });
  }
  function handleConfirmChange(v: string) {
    setConfirmPassword(v);
    if (touched.confirmPassword) validateField('confirmPassword', { name, email, password, confirmPassword: v });
  }

  function validateAll(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegister() {
    console.log('[Register] Create account pressed for:', email);
    if (!validateAll()) {
      console.log('[Register] Validation failed, errors:', errors);
      return;
    }
    setServerError('');
    setIsLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password, color });
      console.log('[Register] Registration successful, showing success animation');
      setSubmitSuccess(true);
      Animated.timing(buttonBgAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start(() => {
        setTimeout(() => {
          console.log('[Register] Navigating to tabs');
          router.replace('/(tabs)/(home)');
        }, 600);
      });
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

  // ── derived values ────────────────────────────────────────────────────────

  const strength = getPasswordStrength(password);
  const confirmMatches = confirmPassword.length > 0 && confirmPassword === password;
  const colorName = COLOR_NAMES[color] ?? color;

  const buttonBgColor = buttonBgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.primary, COLORS.success],
  });

  const buttonLabel = submitSuccess ? '✓  Account created!' : isLoading ? 'Creating account…' : 'Create account';

  function animStyle(index: number) {
    return {
      opacity: anims[index].opacity,
      transform: [{ translateY: anims[index].translateY }],
    };
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
        <Animated.View style={animStyle(0)}>
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
        </Animated.View>

        {/* Title */}
        <Animated.View style={[{ gap: 6 }, animStyle(1)]}>
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
        </Animated.View>

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

        {/* Name */}
        <Animated.View style={animStyle(2)}>
          <InputField
            label="Full name"
            value={name}
            onChangeText={handleNameChange}
            onBlur={() => handleBlur('name')}
            placeholder="Alice Smith"
            error={errors.name}
            icon={User}
            autoFocus
            disabled={isLoading}
            onSubmitEditing={() => emailRef.current?.focus()}
          />
        </Animated.View>

        {/* Email */}
        <Animated.View style={animStyle(3)}>
          <InputField
            label="Email"
            value={email}
            onChangeText={handleEmailChange}
            onBlur={() => handleBlur('email')}
            placeholder="you@example.com"
            error={errors.email}
            icon={Mail}
            keyboardType="email-address"
            inputRef={emailRef}
            disabled={isLoading}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
        </Animated.View>

        {/* Password */}
        <Animated.View style={animStyle(4)}>
          <InputField
            label="Password"
            value={password}
            onChangeText={handlePasswordChange}
            onBlur={() => handleBlur('password')}
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
            disabled={isLoading}
            onSubmitEditing={() => confirmRef.current?.focus()}
          >
            {password.length > 0 && <StrengthBar strength={strength} />}
          </InputField>
        </Animated.View>

        {/* Confirm password */}
        <Animated.View style={animStyle(5)}>
          <InputField
            label="Confirm password"
            value={confirmPassword}
            onChangeText={handleConfirmChange}
            onBlur={() => handleBlur('confirmPassword')}
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
            disabled={isLoading}
            onSubmitEditing={handleRegister}
            rightElement={
              confirmMatches ? (
                <Check size={18} color={COLORS.success} />
              ) : undefined
            }
          />
        </Animated.View>

        {/* Color picker */}
        <Animated.View style={[{ gap: 8 }, animStyle(6)]}>
          <ColorPicker
            selectedColor={color}
            onSelect={(c) => {
              console.log('[Register] Color selected:', c, COLOR_NAMES[c] ?? c);
              setColor(c);
            }}
            label="Pick your color"
          />
          <Text
            style={{
              fontSize: 12,
              color: COLORS.textSecondary,
              fontFamily: 'SpaceGrotesk-Regular',
              marginTop: -2,
            }}
          >
            {colorName}
          </Text>
        </Animated.View>

        {/* Create account button */}
        <Animated.View style={[animStyle(7), { opacity: pulseAnim }]}>
          <AnimatedPressable
            onPress={handleRegister}
            disabled={isLoading || submitSuccess}
            accessibilityLabel="Create account"
            accessibilityRole="button"
          >
            <Animated.View
              style={{
                backgroundColor: buttonBgColor,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  fontFamily: 'SpaceGrotesk-Bold',
                }}
              >
                {buttonLabel}
              </Text>
            </Animated.View>
          </AnimatedPressable>
        </Animated.View>

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
            <AnimatedPressable onPress={() => console.log('[Register] Navigate to login')}>
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
            </AnimatedPressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
