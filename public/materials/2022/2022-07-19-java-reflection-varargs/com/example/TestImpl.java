package com.example;

import java.lang.reflect.Method;

public class TestImpl {
    public static void test_concat() throws Exception {
        Method method = Impl.class.getDeclaredMethod("concat", String[].class);
        method.setAccessible(true);
        assert "aaabbb".equals(method.invoke(null, (Object)new String[]{"aaa", "bbb"}));
    }
}
