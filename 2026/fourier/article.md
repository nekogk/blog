함수에서 벡터의 연산을 한다는 발상은 흥미롭다. 정확히는 함수를 벡터로 변환하는 것이 아닌, 벡터의 연산을 함수에서 정의하는 것으로 끝나긴 하지만 말이다. 푸리에 급수는 이 정의를 십분 사용한다.

글을 시작하기 전에, 푸리에 급수에 대하여 자세하게 알려준 스치(Läie Z. Sthîe)께 감사를 표한다.

# 함수와 벡터
---
함수는 어떻게 벡터일까. 아니, 이전에 벡터가 어떻게 함수일지 생각해보자. 벡터를 함수로 만드는 것은 간단하다.  $n$차원의 벡터가 있을 때, 정의역이 $n$ 이하의 자연수인 함수를 생각하자. 그리고, 각 자연수를을 입력받은 함수는 해당 자연수 번째 차원의 성분 크기를 출력한다. 
$$
\vec r = \langle a, b, c \rangle \rightarrow f(x) = \begin{cases} a & \text{if } x =1 \\ b & \text{if } x = 2 \\  c & \text{if } x = 3 \end{cases}
$$

이를 반대로 하면 정의역이 $n$ 이하의 자연수인 함수는 유한 차원의 벡터에 대응시킬 수 있을 것이다. 이로서 어떤 함수에는 벡터의 연산을 적용할 준비가 되었다.

# 함수의 내적
---
내적 연산은 간단하다. 각 차원의 성분을 서로 곱한 후, 더하면 된다. 이를 함수에 대응시키면, 정의역의 원소마다 대응되는 두 함수의 치역을 곱한 후, 전부 더하면 된다고 생각할 수 있다. 함수의 내적은 $\langle f(x),g(x) \rangle$와 같이 쓴다.
$$
\langle f(x), g(x) \rangle  = \sum^n_{i=1}f(x)g(x)
$$

아직은 함수의 정의역이 자연수 집합의 유한한 부분집합이라는 것을 유의하자. 화분(和分)과 적분의 관계를 생각하면, 방금 정의한 함수의 내적은 화분이다. 하지만 우리는 이를 적분으로 바꿔서, 정의역이 실수 집합의 부분집합, $[-p, p]$인 함수로 확장할 수 있다. 우리의 목표는 푸리에 급수이고, 푸리에 급수는 삼각함수로의 분해이다. 삼각함수로 분해했으니 당연히 이렇게 나타내진 함수는 주기함수가 된다. 그렇다면 그 주기 밖의 범위는 생각할 필요가 없다. 이 단위 주기를  $[-p, p]$라 하고, 앞으로 함수들은 모두 $[-p, p]$ 범위에서만 생각하자. 
$$
\langle f(x), g(x) \rangle  = \int^p_{-p} f(x)g(x) dx
$$

# 단위벡터와 정규함수
---
벡터에서 방향을 제거하면 벡터의 크기, 즉 노름(Norm)이 된다. 노름은 내적으로 구할 수 있기에, 함수의 노름도 쉽게 생각해 볼 수 있다.
$$
\| \vec r\| = \sqrt{\vec r \cdot \vec r} \rightarrow \|f(x)\| = \sqrt{\langle f(x), f(x)\rangle}
$$

어떤 벡터를 그 벡터의 노름으로 나누면 크기가 $1$인 단위 벡터가 된다. 이에 대응되는 함수를 정규함수라 한다.
$$
{\vec r \over \| \vec r\|} \rightarrow {f(x) \over \| f(x)\|}
$$

# 함수의 직교
---
벡터는 크기 뿐만 아니라 방향도 가진다. 두 벡터가 직교한다는 것은, 두 벡터의 내적이 $0$이라는 것과 완전히 동일하다. 이어서, 함수가 직교한다는 것 또한 두 함수의 내적이 $0$이라는 것으로 정의해볼 수 있다.
$$
f(x) \perp g(x) \iff \langle f(x), g(x) \rangle = 0
$$

차원이란 무엇인가. $n$개의 차원이 있다는 것은, $n$개의 원소가 있는 서로 직교하는 방향들의 집합이 있고, 이 원소들을 조합하여 모든 가능한 벡터를 만들 수 있다는 것이다. 3차원에는 3개의 직교하는 방향, 즉 축이 있다. 함수에서도 이 축을 그려볼 수 있다. 단지 무한 개일 뿐이다. 이 축을 이루는 함수들을 직교 기저 함수라 하고, 이들의 집합을 $\mathcal{E}$이라 쓰자. 
$$
\mathcal{E} = \{1\} \cup \{ \cos{n\pi \over p}x \vert n \in \mathbb{N} \} \cup \{ \sin{n\pi \over p}x \vert n \in \mathbb{N} \}
$$

자연수의 집합은 무한하므로, 직교 기저 함수의 집합도 무한하다. 그렇다면 이들은 과연 축과 같은 성질을 지닐까? 어떤 두개의 함수를 이 집합에서 선택해도 직교할까?

$1$은 우함수이다. $\cos$은 우함수이다. $\sin$은 기함수이다. 우함수와 기함수를 곱하면 기함수가 되고, 우함수와 우함수, 또는 기함수와 기함수를 곱하면 우함수가 된다. 그리고  $[-p, p]$ 범위에서 적분할 때, 적분되는 함수가 기함수라면 정적분은 $0$이다. 즉, 직교한다.

그렇다면 기함수와 기함수, 우함수와 우함수를 곱한 경우만 생각해도 된다. 이 경우들의 정적분이 $0$이 나와서, 서로 직교할까?
$$
\langle 1, \cos{n\pi \over p}x \rangle = \int^p_{-p} \cos{n\pi \over p}x  dx = [{p \over n\pi}\sin  {n\pi \over p}x]^p_{-p} = 0
$$

$\cos$을 적분하면 $\sin$이 나온다. 우리의 식에서, $p, -p$를 넣었을 때 모두 $\sin$은 $0$이 됨을 알 수 있다. 즉 다음의 경우들도 간단하게 $0$임을 보일 수 있다.
$$
\langle \cos{n\pi \over p}x, \cos{m\pi \over p}x \rangle = \int^p_{-p} \cos{n\pi \over p}x \cos{m\pi \over p}x  dx =  {1\over 2} \int^p_{-p}  \cos {(n-m) \pi  \over p}x  + \cos {(n+m) \pi \over p}x dx = 0
$$
$$
\langle \sin{n\pi \over p}x, \sin{m\pi \over p}x \rangle = \int^p_{-p} \sin{n\pi \over p}x \sin{m\pi \over p}x  dx =  {1\over 2} \int^p_{-p}  \cos {(n-m) \pi  \over p}x  - \cos {(n+m) \pi \over p}x dx = 0
$$

즉, $\mathcal{E}$의 모든 원소는 서로 직교하는 함수이다.

# 성분의 크기
---
$\vec r$의 $\vec u$ 방향 성분의 크기는 어떻게 구할 수 있을까? 두 벡터의 사이각을 $\theta$라 하면, 기하학적으로 간단히 $\| \vec r\| \cos \theta$ 임을 알 수 있다. 이는 내적을 이용하여 다음과 같이 나타낼 수 있다.
$$
\| \vec r\| \cos \theta = {\| \vec r\| \| \vec u\| \cos \theta \over \| \vec u\|} = {\vec r \cdot \vec u \over \| \vec u\|}
$$

또한 서로 직교하는 모든 방향 $\vec e_i$에 대해 $\vec r$은 각 성분의 크기로 분해하여서 다음과 같이 표현할 수 있다.
$$
\vec r = \sum^n_{i=1}{\vec r \cdot \vec e_i \over \| \vec e_i\|}\times { \vec e_i\over \| \vec e_i\|} = \sum^n_{i=1}{\vec r \cdot \vec e_i \over \| \vec e_i\|^2}\vec e_i
$$

이를 자연스럽게 함수에 대해서도 확장해서, $f(x)$는 각 $\mathcal{E}$의 원소, 즉 직교 기저 함수들 $\phi_n(x)$과 그 성분의 크기의 합으로 나타낼 수 있다.
$$
f(x) = \sum^\infty_{n=1}{\langle f(x) , \phi_n(x) \rangle \over \| \phi_n(x)\|^2}\phi_n(x) 
$$

이는 $\phi_n(x)$의 스칼라 배의 합으로 $f(x)$를 나타낸 것이다. $\phi_i(x)$는 모두 삼각함수이거나 상수이므로, $f(x)$는 삼각함수와 상수항의 합으로 분해되었다.

# 일반화
---
푸리에 급수를 구할 때 매번 함수를 내적하고 노름의 제곱으로 나누는 행동을 하기는 힘들기 때문에, 함수의 계수부를 다음과 같이 바꾸어 적는다.
$$
f(x) = {a_0 \over 2} + \sum^\infty_{n=1}a_n\cos{n\pi \over p}x + \sum^\infty_{n=1}b_n\sin{n\pi \over p}x
$$

이 계수들의 값은 다음과 같이 구해진다.
$$
a_0 = 2{\langle f(x) , 1 \rangle \over \| 1\|^2} = 2{\int^p_{-p} f(x) dx \over \int^p_{-p} dx} = {1 \over p} \int^p_{-p} f(x) dx
$$
$$
a_n = {\langle f(x) , \cos{n\pi \over p}x \rangle \over \| \cos{n\pi \over p}x\|^2} = {\int^p_{-p} f(x) \cos{n\pi \over p}x dx \over \int^p_{-p} \cos^2{n\pi \over p}x dx} = {1 \over p} \int^p_{-p} f(x) \cos{n\pi \over p} dx
$$
$$
b_n = {\langle f(x) , \sin{n\pi \over p}x \rangle \over \| \sin{n\pi \over p}x\|^2} = {\int^p_{-p} f(x) \sin{n\pi \over p}x dx \over \int^p_{-p} \sin^2{n\pi \over p}x dx} = {1 \over p} \int^p_{-p} f(x) \sin{n\pi \over p} dx
$$

테일러 급수의 발상이 특정 점에서 무한 번 미분하는 것이였다면, 푸리에 급수의 발상은 함수의 내적을 정의하면 삼각함수들이 직교한다는 것이다. 처음 벡터와 함수의 대응에 대해서 들었을 때는 이것이 푸리에 함수와 관련이 있을 것이라고 생각도 못했다. 이렇게 관련이 없는 것 같아 보이는 것이 관련이 있는 수학이 매력적인 것도 같다.