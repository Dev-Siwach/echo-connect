import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Cpu, Database, Cloud, ExternalLink, Mail, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function AboutPage() {
  return (
    <div className="space-y-10 max-w-2xl mx-auto">
      {/* Intro */}
      <section className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
          About EcoConnect
        </h1>
        <p className="text-base text-zinc-600 leading-relaxed">
          EcoConnect is an environmental action assistant built for the <strong>AWS Environmental Hacks 2026</strong>. It helps residents in Faridabad navigate practical, verified pathways for unwanted electronics, batteries, and reusable household items.
        </p>
      </section>

      {/* Core Principle */}
      <Card className="bg-brand-50/60 border-brand-200 p-5 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-brand-950 mb-2">
          Our Core Rule: Interpret, Never Invent
        </h2>
        <p className="text-xs sm:text-sm text-brand-900 leading-relaxed mb-3">
          Generative AI excels at understanding messy human language and multi-item descriptions in English, Hindi, and Hinglish. But LLMs are prone to hallucinating contact details and business addresses.
        </p>
        <blockquote className="border-l-4 border-brand-700 pl-3 italic text-xs sm:text-sm text-brand-950 font-medium">
          &ldquo;Bedrock understands people; the database guarantees the facts.&rdquo;
        </blockquote>
      </Card>

      {/* How We Verify Services (FR-17) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-900">
          How We Verify Providers
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600">
          Every provider card in EcoConnect includes an explicit verification badge indicating how and when the record was confirmed:
        </p>

        <div className="space-y-3">
          <Card className="p-4 border-l-4 border-l-emerald-600">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="success">✅ Confirmed by phone</Badge>
              <span className="text-xs text-zinc-400">Level 3</span>
            </div>
            <p className="text-xs text-zinc-600">
              Directly called by our research team to confirm that they actively accept the specified item types, collection bins are present, and operating hours are current.
            </p>
          </Card>

          <Card className="p-4 border-l-4 border-l-sky-600">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="info">🏛 On official authorized list</Badge>
              <span className="text-xs text-zinc-400">Level 2</span>
            </div>
            <p className="text-xs text-zinc-600">
              Cross-referenced against official State Pollution Control Board (SPCB) registered e-waste dismantler and collection center directories.
            </p>
          </Card>

          <Card className="p-4 border-l-4 border-l-emerald-600">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="success">📍 Verified in person</Badge>
              <span className="text-xs text-zinc-400">Level 3</span>
            </div>
            <p className="text-xs text-zinc-600">
              Physically visited by a team member to verify the facility or drop-off kiosk.
            </p>
          </Card>

          <Card className="p-4 border-l-4 border-l-amber-500">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="warning">⚠ Not yet verified</Badge>
              <span className="text-xs text-zinc-400">Level 0</span>
            </div>
            <p className="text-xs text-zinc-600">
              Submitted by the community or discovered via directories, but not yet telephone-confirmed. Kept collapsed under &ldquo;Unconfirmed listings&rdquo;.
            </p>
          </Card>
        </div>
      </section>

      {/* AWS Architecture Overview */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-900">
          AWS Architecture
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 text-sm">
              <Cloud className="w-4 h-4 text-brand-700" />
              <span>AWS Amplify Hosting</span>
            </div>
            <p className="text-zinc-600">
              Static web delivery using Next.js 14 static export (<code className="bg-zinc-100 px-1 py-0.5 rounded text-[11px]">output: &apos;export&apos;</code>). Zero server compute overhead.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 text-sm">
              <Cpu className="w-4 h-4 text-purple-700" />
              <span>Amazon Bedrock</span>
            </div>
            <p className="text-zinc-600">
              Converse API with forced tool use (<code className="bg-zinc-100 px-1 py-0.5 rounded text-[11px]">record_interpretation</code>) ensuring 100% strict JSON taxonomy classification.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 text-sm">
              <Database className="w-4 h-4 text-blue-700" />
              <span>Amazon DynamoDB</span>
            </div>
            <p className="text-zinc-600">
              Partitioned by city for fast on-demand provider queries with in-memory ranking and distance computation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 font-bold text-zinc-900 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Deterministic Rules</span>
            </div>
            <p className="text-zinc-600">
              Route rules follow the strict waste hierarchy (Repair &rarr; Resell &rarr; Donate &rarr; E-waste &rarr; Recycle) rather than probabilistic guesses.
            </p>
          </div>
        </div>
      </section>

      {/* Suggest a Service (FR-17) */}
      <section id="suggest" className="space-y-4 pt-4 border-t border-zinc-200">
        <h2 className="text-xl font-bold text-zinc-900">
          Suggest or Report a Service
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600">
          Know an authorized e-waste collection center, appliance repair shop, or active NGO donation drive in Faridabad? Let us know so our team can verify and list it.
        </p>

        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-zinc-900 text-sm">Submit listing details</h3>
            <p className="text-xs text-zinc-500">
              Send us the name, locality, address, and phone number.
            </p>
          </div>
          <a
            href="mailto:ecoconnect-pilot@example.com?subject=Suggest%20or%20Report%20a%20Service%20in%20Faridabad"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
          >
            <Mail className="w-4 h-4" />
            <span>Email Submission</span>
          </a>
        </div>
      </section>

      {/* Data Disclaimer (ADR-001, ADR-012) */}
      <section id="disclaimer" className="space-y-3 pt-4 border-t border-zinc-200 text-xs text-zinc-500 leading-relaxed">
        <h2 className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
          Data Disclaimer & Privacy
        </h2>
        <p>
          EcoConnect does not store personal account credentials, passwords, or personal search histories. We do not invent fake business listings or display unverified environmental carbon emission metrics. All displayed provider listings in this pilot are curated for demonstration purposes during the hackathon.
        </p>
      </section>
    </div>
  );
}
