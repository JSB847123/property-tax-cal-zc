"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Calculator, FileText, PieChart, RefreshCw } from "lucide-react"

interface TaxCalculation {
  공시가격: number
  공정시장가액비율: number
  과세표준: number
  재산세율구간: string
  재산세산출세액: number
  원래재산세산출세액: number // 세부담상한 적용 전 원래 금액
  도시지역분: number
  지방교육세: number
  소방분지역자원시설세: number
  총산출세액: number
  세부담상한액: number | null
  최종납부세액: number
  세부담상한적용여부: boolean
  초기총산출세액_세부담상한적용전: number
}

export default function PropertyTaxCalculator() {
  const [공시가격, set공시가격] = useState<string>("")
  const [일세대일주택, set일세대일택] = useState<string>("yes")
  const [작년납부세액, set작년납부세액] = useState<string>("")
  const [도시지역여부, set도시지역여부] = useState<boolean>(true)
  const [소방분계산방식, set소방분계산방식] = useState<string>("standard")
  const [계산결과, set계산결과] = useState<TaxCalculation | null>(null)
  const [소방분과세표준, set소방분과세표준] = useState<string>("")
  const [표시모드, set표시모드] = useState<string>("annual")
  const [재산세율구간, set재산세율구간] = useState<string>("")

  // 초기화 함수
  const 초기화 = () => {
    set공시가격("")
    set일세대일택("yes")
    set작년납부세액("")
    set도시지역여부(true)
    set소방분계산방식("standard")
    set계산결과(null)
    set소방분과세표준("")
    set표시모드("annual")
    set재산세율구간("")
  }

  // 숫자 입력 포맷팅 함수
  const formatInputNumber = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "")
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // 입력값에서 숫자만 추출하는 함수
  const parseInputNumber = (value: string) => {
    return value.replace(/[^0-9]/g, "")
  }

  // 소방분 지역자원시설세 계산 함수
  const 소방분계산 = (과세표준: number, 계산방식: string): number => {
    const 사용할과세표준 = Number.parseFloat(parseInputNumber(소방분과세표준)) || 과세표준

    if (계산방식 === "standard") {
      // 표준세율
      if (사용할과세표준 <= 6000000) {
        return Math.floor((사용할과세표준 * (4 / 10000)) / 10) * 10 // 10,000분의 4
      } else if (사용할과세표준 <= 13000000) {
        return Math.floor((2400 + (사용할과세표준 - 6000000) * (5 / 10000)) / 10) * 10 // 2,400원 + 초과금액×5/10,000
      } else if (사용할과세표준 <= 26000000) {
        return Math.floor((5900 + (사용할과세표준 - 13000000) * (6 / 10000)) / 10) * 10 // 5,900원 + 초과금액×6/10,000
      } else if (사용할과세표준 <= 39000000) {
        return Math.floor((13700 + (사용할과세표준 - 26000000) * (8 / 10000)) / 10) * 10 // 13,700원 + 초과금액×8/10,000
      } else if (사용할과세표준 <= 64000000) {
        return Math.floor((24100 + (사용할과세표준 - 39000000) * (10 / 10000)) / 10) * 10 // 24,100원 + 초과금액×10/10,000
      } else {
        return Math.floor((49100 + (사용할과세표준 - 64000000) * (12 / 10000)) / 10) * 10 // 49,100원 + 초과금액×12/10,000
      }
    } else {
      // 간이세율
      if (사용할과세표준 <= 6000000) {
        return Math.floor((사용할과세표준 * 0.0004) / 10) * 10 // 과세표준액×0.04%
      } else if (사용할과세표준 <= 13000000) {
        return Math.floor((사용할과세표준 * 0.0005 - 600) / 10) * 10 // 과세표준액×0.05% - 600원
      } else if (사용할과세표준 <= 26000000) {
        return Math.floor((사용할과세표준 * 0.0006 - 1900) / 10) * 10 // 과세표준액×0.06% - 1,900원
      } else if (사용할과세표준 <= 39000000) {
        return Math.floor((사용할과세표준 * 0.0008 - 7100) / 10) * 10 // 과세표준액×0.08% - 7,100원
      } else if (사용할과세표준 <= 64000000) {
        return Math.floor((사용할과세표준 * 0.001 - 14900) / 10) * 10 // 과세표준액×0.1% - 14,900원
      } else {
        return Math.floor((사용할과세표준 * 0.0012 - 27700) / 10) * 10 // 과세표준액×0.12% - 27,700원
      }
    }
  }

  // 소방분 지역자원시설세 세율 설명 가져오기
  const get소방분세율설명 = (과세표준: number): string => {
    if (과세표준 <= 6000000) {
      return "6백만원 이하: 10,000분의 4"
    } else if (과세표준 <= 13000000) {
      return "6백만원 초과 1천3백만원 이하: 2,400원 + 초과금액×10,000분의 5"
    } else if (과세표준 <= 26000000) {
      return "1천3백만원 초과 2천6백만원 이하: 5,900원 + 초과금액×10,000분의 6"
    } else if (과세표준 <= 39000000) {
      return "2천6백만원 초과 3천9백만원 이하: 13,700원 + 초과금액×10,000분의 8"
    } else if (과세표준 <= 64000000) {
      return "3천9백만원 초과 6천4백만원 이하: 24,100원 + 초과금액×10,000분의 10"
    } else {
      return "6천4백만원 초과: 49,100원 + 초과금액×10,000분의 12"
    }
  }

  const 재산세본세계산 = (과세표준: number, 특례세율적용: boolean): { 세액: number; 세율구간: string } => {
    let 세액 = 0
    let 세율구간 = ""

    if (특례세율적용) {
      // 주택 공시가격 9억 이하 1세대 1주택자 특례세율
      if (과세표준 <= 60000000) {
        세액 = Math.floor((과세표준 * 0.005) / 10) * 10 // 5/1,000
        세율구간 = "6천만원 이하: 과세표준의 0.5%"
      } else if (과세표준 <= 150000000) {
        세액 = Math.floor((30000 + (과세표준 - 60000000) * 0.001) / 10) * 10 // 1/1,000
        세율구간 = "6천만원 초과 1.5억원 이하: 3만원 + 6천만원 초과금액의 0.1%"
      } else if (과세표준 <= 300000000) {
        세액 = Math.floor((120000 + (과세표준 - 150000000) * 0.002) / 10) * 10 // 2/1,000
        세율구간 = "1.5억원 초과 3억원 이하: 12만원 + 1.5억원 초과금액의 0.2%"
      } else {
        // 300,000,000원 초과
        세액 = Math.floor((420000 + (과세표준 - 300000000) * 0.0035) / 10) * 10 // 3.5/1,000
        세율구간 = "3억원 초과: 42만원 + 3억원 초과금액의 0.35%"
      }
    } else {
      // 일반 주택 세율 (다주택자, 법인, 9억원 초과 1주택자)
      if (과세표준 <= 60000000) {
        세액 = Math.floor((과세표준 * 0.001) / 10) * 10 // 1/1,000
        세율구간 = "6천만원 이하: 과세표준의 0.1%"
      } else if (과세표준 <= 150000000) {
        세액 = Math.floor((60000 + (과세표준 - 60000000) * 0.0015) / 10) * 10 // 1.5/1,000
        세율구간 = "6천만원 초과 1.5억원 이하: 6만원 + 6천만원 초과금액의 0.15%"
      } else if (과세표준 <= 300000000) {
        세액 = Math.floor((195000 + (과세표준 - 150000000) * 0.0025) / 10) * 10 // 2.5/1,000
        세율구간 = "1.5억원 초과 3억원 이하: 19.5만원 + 1.5억원 초과금액의 0.25%"
      } else {
        // 300,000,000원 초과
        세액 = Math.floor((570000 + (과세표준 - 300000000) * 0.004) / 10) * 10 // 4/1,000
        세율구간 = "3억원 초과: 57만원 + 3억원 초과금액의 0.4%"
      }
    }
    return { 세액, 세율구간 }
  }

  const 재산세계산 = () => {
    const 공시가격값 = Number.parseFloat(parseInputNumber(공시가격)) || 0
    const 작년세액 = Number.parseFloat(parseInputNumber(작년납부세액)) || 0

    if (공시가격값 === 0) {
      alert("공시가격을 입력해주세요.")
      return
    }

    let 공정시장가액비율 = 0
    if (일세대일주택 === "yes") {
      if (공시가격값 <= 300000000) {
        공정시장가액비율 = 0.43
      } else if (공시가격값 <= 600000000) {
        공정시장가액비율 = 0.44
      } else {
        공정시장가액비율 = 0.45
      }
    } else {
      // 다주택자 또는 법인
      공정시장가액비율 = 0.6
    }
    const 과세표준 = Math.floor(공시가격값 * 공정시장가액비율)

    const 특례세율적용 = 일세대일주택 === "yes" && 공시가격값 <= 900000000

    const { 세액: 재산세산출세액_본세, 세율구간 } = 재산세본세계산(과세표준, 특례세율적용)
    set재산세율구간(세율구간)

    const 도시지역분 = 도시지역여부 ? Math.floor((과세표준 * 0.0014) / 10) * 10 : 0
    const 지방교육세 = Math.floor((재산세산출세액_본세 * 0.2) / 10) * 10 // 재산세(본세) × 0.2
    const 소방분지역자원시설세 = 소방분계산(과세표준, 소방분계산방식)

    // 2025년 예상 재산세 = 재산세(본세) + 도시지역분 + 지역자원시설세 + 지방교육세
    const 총산출세액_세부담상한적용전 = 재산세산출세액_본세 + 도시지역분 + 지방교육세 + 소방분지역자원시설세

    let 최종납부세액 = 총산출세액_세부담상한적용전
    let 세부담상한액: number | null = null
    let 세부담상한적용여부 = false

    let 표시용_재산세산출세액 = 재산세산출세액_본세
    let 표시용_지방교육세 = 지방교육세
    const 원래재산세산출세액 = 재산세산출세액_본세

    if (작년세액 > 0) {
      // 세부담상한액 = 2024년 납부한 재산세(본세) + (2024년 납부한 재산세(본세) * 10%)
      세부담상한액 = Math.floor((작년세액 * 1.1) / 10) * 10

      if (재산세산출세액_본세 > 세부담상한액) {
        세부담상한적용여부 = true
        // 재산세 본세만 상한액으로 조정, 다른 세목은 그대로 유지
        표시용_재산세산출세액 = 세부담상한액
        // 지방교육세는 조정된 재산세 본세 기준으로 재계산
        표시용_지방교육세 = Math.floor((세부담상한액 * 0.2) / 10) * 10
        최종납부세액 = 세부담상한액 + 도시지역분 + 표시용_지방교육세 + 소방분지역자원시설세
      }
    }

    set계산결과({
      공시가격: 공시가격값,
      공정시장가액비율: 공정시장가액비율 * 100,
      과세표준,
      재산세율구간,
      재산세산출세액: 표시용_재산세산출세액, // 세부담상한 적용된 값
      원래재산세산출세액, // 세부담상한 적용 전 원래 금액
      도시지역분,
      지방교육세: 표시용_지방교육세, // 세부담상한 적용된 값
      소방분지역자원시설세,
      총산출세액: 최종납부세액, // 최종 납부세액 (세부담상한 적용 후 총액)
      세부담상한액,
      최종납부세액,
      세부담상한적용여부,
      초기총산출세액_세부담상한적용전: 총산출세액_세부담상한적용전,
    })
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ko-KR").format(num)
  }

  const getTaxBreakdown = () => {
    if (!계산결과) return []

    // 표시모드에 따라 금액 조정
    const 금액조정계수 = 표시모드 === "quarterly" ? 0.5 : 1

    // 각 세목별 금액을 조정
    const 조정된_재산세산출세액 = Math.floor((계산결과.재산세산출세액 * 금액조정계수) / 10) * 10
    const 조정된_지방교육세 = Math.floor((계산결과.지방교육세 * 금액조정계수) / 10) * 10
    const 조정된_소방분지역자원시설세 = Math.floor((계산결과.소방분지역자원시설세 * 금액조정계수) / 10) * 10
    const 조정된_도시지역분 = Math.floor((계산결과.도시지역분 * 금액조정계수) / 10) * 10

    const items = [
      {
        name: "재산세 본세",
        amount: 조정된_재산세산출세액,
        color: "bg-blue-500",
        description:
          계산결과.세부담상한적용여부 && 계산결과.세부담상한액 !== null
            ? `실 계산: ${formatNumber(계산결과.원래재산세산출세액)}원, 세부담상한제 적용으로 전년세액: ${formatNumber(Number.parseFloat(parseInputNumber(작년납부세액)) || 0)}원, 상한제 적용: ${formatNumber(계산결과.재산세산출세액)}원`
            : `과세표준 × ${일세대일주택 === "yes" && 계산결과.공시가격 <= 900000000 ? "특례세율" : "일반세율"}`,
      },
      {
        name: "지방교육세",
        amount: 조정된_지방교육세,
        color: "bg-green-500",
        description: `재산세 본세(${formatNumber(계산결과.재산세산출세액)}원) × 20%`,
      },
      {
        name: "소방분 지역자원시설세",
        amount: 조정된_소방분지역자원시설세,
        color: "bg-purple-500",
        description: `과세표준 × 표준세율`,
      },
    ]

    if (계산결과.도시지역분 > 0) {
      items.push({
        name: "재산세 도시지역분",
        amount: 조정된_도시지역분,
        color: "bg-orange-500",
        description: "과세표준 × 0.14%",
      })
    }

    return items.filter((item) => item.amount > 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-blue-600 tracking-wider uppercase mb-2">TAX CALCULATOR</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Property Tax Calculator</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            2025년 재산세 운용실무 기준으로 정확한 재산세를 계산해드립니다
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 입력 섹션 */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-white">
              <CardTitle className="text-xl text-gray-900">주택 정보 입력</CardTitle>
              <CardDescription>정확한 세액 계산을 위해 아래 정보를 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 bg-white">
              <div className="space-y-3">
                <Label htmlFor="공시가격" className="text-sm font-medium text-gray-700">
                  2025년 주택 공시가격
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₩</span>
                  <Input
                    id="공시가격"
                    type="text"
                    placeholder="302,000,000"
                    value={공시가격}
                    onChange={(e) => set공시가격(formatInputNumber(e.target.value))}
                    className="pl-8 h-12 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">1세대 1주택 해당 여부</Label>
                <RadioGroup value={일세대일주택} onValueChange={set일세대일택} className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="yes" id="yes" className="text-blue-600" />
                    <Label htmlFor="yes" className="text-sm">
                      1세대 1주택
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="no" id="no" className="text-blue-600" />
                    <Label htmlFor="no" className="text-sm">
                      2주택(다주택)자 이상 또는 법인
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label htmlFor="작년세액" className="text-sm font-medium text-gray-700">
                  2024년 납부한 재산세(본세)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₩</span>
                  <Input
                    id="작년세액"
                    type="text"
                    placeholder="1,200,000"
                    value={작년납부세액}
                    onChange={(e) => set작년납부세액(formatInputNumber(e.target.value))}
                    className="pl-8 h-12 border-gray-200 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500">세부담상한제 적용을 위해 입력하세요</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="소방분과세표준" className="text-sm font-medium text-gray-700">
                  소방분 지역자원시설세 과세표준
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₩</span>
                  <Input
                    id="소방분과세표준"
                    type="text"
                    placeholder="재산세 과세표준과 동일"
                    value={소방분과세표준}
                    onChange={(e) => set소방분과세표준(formatInputNumber(e.target.value))}
                    className="pl-8 h-12 border-gray-200 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500">비워두면 재산세 과세표준과 동일하게 적용됩니다</p>
              </div>

              {/* 계산 버튼 */}
              <Button onClick={재산세계산} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                <Calculator className="h-5 w-5 mr-2" />
                재산세 계산하기
              </Button>

              {/* 초기화 버튼 */}
              <Button
                onClick={초기화}
                variant="outline"
                className="w-full h-12 border-gray-300 hover:bg-gray-100 text-gray-700 font-medium"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                초기화
              </Button>
            </CardContent>
          </Card>

          {/* 결과 섹션 */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-900">계산 결과</CardTitle>
                  <CardDescription>2025년 예상 재산세</CardDescription>
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={표시모드 === "quarterly" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => set표시모드("quarterly")}
                    className="text-xs"
                  >
                    분기별
                  </Button>
                  <Button
                    variant={표시모드 === "annual" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => set표시모드("annual")}
                    className="text-xs"
                  >
                    연간
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="bg-white">
              {계산결과 ? (
                <div className="space-y-6">
                  {/* 메인 결과 */}
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-600 mb-2">
                      총 {표시모드 === "annual" ? "연간" : "분기별"} 세액 (공시가격 ₩{formatNumber(계산결과.공시가격)}{" "}
                      기준)
                    </p>
                    <div className="text-5xl font-bold text-blue-600 mb-4">
                      ₩
                      {formatNumber(
                        표시모드 === "annual"
                          ? 계산결과.최종납부세액
                          : getTaxBreakdown().reduce((sum, item) => sum + item.amount, 0),
                      )}
                    </div>
                    {표시모드 === "quarterly" && (
                      <p className="text-sm text-gray-500">연간 총액: ₩{formatNumber(계산결과.최종납부세액)}</p>
                    )}
                  </div>

                  {/* 세목별 구성 */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <PieChart className="h-4 w-4" />
                      세목별 구성
                    </h4>
                    <div className="space-y-3">
                      {getTaxBreakdown().map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                            <span className="text-sm text-gray-700">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">₩{formatNumber(item.amount)}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 시각적 바 */}
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div className="h-full flex">
                        {getTaxBreakdown().map((item, index) => {
                          const 총액 = getTaxBreakdown().reduce((sum, item) => sum + item.amount, 0)
                          const percentage = ((item.amount / 총액) * 100).toFixed(1)
                          return <div key={index} className={item.color} style={{ width: `${percentage}%` }}></div>
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 상세 정보 */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">과세표준 (재산세 본세)</span>
                      <span className="font-medium">₩{formatNumber(계산결과.과세표준)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">적용 세율 구간 (재산세 본세)</span>
                      <span className="font-medium text-right">{재산세율구간}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">공정시장가액비율</span>
                      <span className="font-medium">{계산결과.공정시장가액비율.toFixed(0)}%</span>
                    </div>
                    {계산결과.세부담상한액 !== null && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">세부담상한 적용 전 총세액</span>
                          <span className="font-medium">₩{formatNumber(계산결과.초기총산출세액_세부담상한적용전)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">세부담상한액 (전년도 세액 기준)</span>
                          <span className="font-medium">₩{formatNumber(계산결과.세부담상한액)}</span>
                        </div>
                      </>
                    )}
                    {계산결과.세부담상한적용여부 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-600 font-semibold">세부담 상한 적용됨</span>
                        <span className="font-medium text-purple-600">최종 세액 조정</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">주택 정보를 입력하고</p>
                  <p className="text-gray-500">"재산세 계산하기" 버튼을 눌러주세요</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 민원인 안내 사항 */}
        {계산결과 && (
          <Card className="mt-8 shadow-lg border-0">
            <CardHeader className="bg-white">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                민원인 안내 사항
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white">
              <div className="space-y-6 text-sm text-gray-700">
                <h2 className="text-lg font-bold text-gray-900">
                  {일세대일주택 === "yes" ? "1세대 1주택자인 경우 민원인 안내" : "2주택자 이상인 경우 민원인 안내"}
                </h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">
                      1. 재산세 본세: {formatNumber(계산결과.재산세산출세액)}원(분기별{" "}
                      {formatNumber(Math.floor((계산결과.재산세산출세액 * 0.5) / 10) * 10)}원)
                    </h3>
                    <div className="pl-4 space-y-1">
                      <p>주택 공시가격: {formatNumber(계산결과.공시가격)}원</p>
                      <p>과세표준: {formatNumber(계산결과.과세표준)}원</p>
                      {일세대일주택 === "yes" ? (
                        <>
                          <p>1세대 1주택자인 경우: 공정시장가액비율 인하 적용</p>
                          <p>
                            1세대 1주택자이면서 시가표준액(주택 공시가격) {formatNumber(계산결과.공시가격)}원이므로
                            공정시장가액비율: {계산결과.공정시장가액비율.toFixed(0)}% 적용
                          </p>
                        </>
                      ) : (
                        <p>1세대 1주택자가 아니기 때문에 공정시장가액비율: {계산결과.공정시장가액비율.toFixed(0)}%</p>
                      )}
                      <p>
                        세율: 과세표준이 {formatNumber(계산결과.과세표준)}원이므로 {재산세율구간.split(":")[0]} 세율이
                        적용
                      </p>
                      {계산결과.세부담상한적용여부 && 계산결과.세부담상한액 !== null ? (
                        <>
                          <p>
                            따라서, {재산세율구간.split(":")[1]} 계산이 되어 {formatNumber(계산결과.원래재산세산출세액)}
                            원이 산출되었으나
                          </p>
                          <p>
                            2024년 납부한 재산세(본세){" "}
                            {formatNumber(Number.parseFloat(parseInputNumber(작년납부세액)) || 0)}원에 10%를 더한
                            금액이므로 {formatNumber(Number.parseFloat(parseInputNumber(작년납부세액)) || 0)}원+(2024년
                            납부한 재산세(본세) * 10%)인 {formatNumber(계산결과.세부담상한액)}원이 세부담상한으로
                            적용되어 {formatNumber(계산결과.재산세산출세액)}원으로 조정됨
                          </p>
                        </>
                      ) : (
                        <p>
                          따라서, {재산세율구간.split(":")[1]} 계산이 되어 {formatNumber(계산결과.재산세산출세액)}원
                        </p>
                      )}
                    </div>
                  </div>

                  {계산결과.도시지역분 > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">
                        2. 재산세 도시지역분: {formatNumber(계산결과.도시지역분)}원(분기별{" "}
                        {formatNumber(Math.floor((계산결과.도시지역분 * 0.5) / 10) * 10)}원)
                      </h3>
                      <div className="pl-4">
                        <p>과세표준 × 0.14%</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-2">
                      {계산결과.도시지역분 > 0 ? "3" : "2"}. 지역자원시설세:{" "}
                      {formatNumber(계산결과.소방분지역자원시설세)}원(분기별{" "}
                      {formatNumber(Math.floor((계산결과.소방분지역자원시설세 * 0.5) / 10) * 10)}원)
                    </h3>
                    <div className="pl-4 space-y-1">
                      <p>지역자원시설세 과세표준 × 세율</p>
                      <p>
                        세율은 과세표준이{" "}
                        {formatNumber(Number.parseFloat(parseInputNumber(소방분과세표준)) || 계산결과.과세표준)}원이므로{" "}
                        {get소방분세율설명(Number.parseFloat(parseInputNumber(소방분과세표준)) || 계산결과.과세표준)}{" "}
                        세율이 적용
                      </p>
                      <p>따라서 계산이 되어 {formatNumber(계산결과.소방분지역자원시설세)}원</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">
                      {계산결과.도시지역분 > 0 ? "4" : "3"}. 지방교육세: {formatNumber(계산결과.지방교육세)}원(분기별{" "}
                      {formatNumber(Math.floor((계산결과.지방교육세 * 0.5) / 10) * 10)}원)
                    </h3>
                    <div className="pl-4">
                      <p>
                        지방교육세는 재산세 본세의 20%이므로 {formatNumber(계산결과.재산세산출세액)}원 × 20% ={" "}
                        {formatNumber(계산결과.지방교육세)}원
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <p className="font-bold text-black text-base">
                      2025년 예상 재산세 = 재산세(본세) + 도시지역분 + 지역자원시설세 + 지방교육세 ={" "}
                      {formatNumber(계산결과.최종납부세액)}원
                    </p>
                    <p className="font-bold text-black text-base">
                      분기별{" "}
                      {formatNumber(
                        Math.floor((계산결과.재산세산출세액 * 0.5) / 10) * 10 +
                          Math.floor((계산결과.도시지역분 * 0.5) / 10) * 10 +
                          Math.floor((계산결과.소방분지역자원시설세 * 0.5) / 10) * 10 +
                          Math.floor((계산결과.지방교육세 * 0.5) / 10) * 10,
                      )}
                      원
                    </p>
                  </div>
                </div>

                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">참고사항</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>재산세 과세표준과 세율: 지방세법 제110~113조</p>
                    <p>1세대 1주택 재산세 공정시장가액비율 인하: 지방세법 시행령 제109조</p>
                    <p>세부담 상한의 계산 시 공정시장가액비율 적용: 지방세법 시행령 제118조</p>
                    <p>재산세 도시지역분: 지방세법 제112조</p>
                    <p>지역자원시설세 과세표준과 세율: 지방세법 제146조</p>
                    <p>지방교육세 과세표준과 세율: 지방세법 제151조</p>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">
                    ※ 이 설명은 입력된 정보를 바탕으로 한 예상치이며, 실제 고지되는 세액과 다를 수 있습니다.
                    세부담상한제는 전년도 실제 납부세액을 기준으로 적용되므로, 정확한 전년도 세액 입력이 중요합니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
